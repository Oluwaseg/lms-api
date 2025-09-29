import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { CourseController } from '../controllers/CourseController';
import { CourseMediaController } from '../controllers/CourseMediaController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { redisRateLimit } from '../middleware/redisRateLimit.middleware';
import { uploadFileStream } from '../utils/cloudinary';
import { validate } from '../validate';
import { courseCreateSchema, courseUpdateSchema } from '../validate/course';
import { enrollmentRouter } from './enrollment';
import { lessonRouter } from './lesson';

export const courseRouter = Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: List published courses
 *     responses:
 *       200:
 *         description: List of courses
 */
courseRouter.get('/', CourseController.list);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get a course by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course
 */
courseRouter.get('/:id', CourseController.get);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a new course (instructor)
 *     security:
 *       - BearerAuth: []
 */
courseRouter.post(
  '/',
  authenticate,
  requireRole('instructor'),
  validate(courseCreateSchema),
  CourseController.create
);

/**
 * @swagger
 * /api/courses/{id}:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Update a course (instructor)
 *     security:
 *       - BearerAuth: []
 */
courseRouter.patch(
  '/:id',
  authenticate,
  requireRole('instructor'),
  validate(courseUpdateSchema),
  CourseController.update
);

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Publish a course (instructor)
 *     security:
 *       - BearerAuth: []
 */
courseRouter.post(
  '/:id/publish',
  authenticate,
  requireRole('instructor'),
  CourseController.publish
);

// Nested routers: lessons and enrollments
courseRouter.use('/:courseId/lessons', lessonRouter);
courseRouter.use('/:courseId/enroll', enrollmentRouter);

// Disk storage to avoid buffering large files in memory
const tmpDir = path.join(os.tmpdir(), 'lms-uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `${unique}${ext}`);
  },
});

// Accept only images for thumbnails
function thumbnailFilter(req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Thumbnail must be an image'), false);
}

// Accept video mime types for short videos
function videoFilter(req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Short video must be a video'), false);
}

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// Rate limiter for media uploads (Redis-backed)
const mediaRateLimit = redisRateLimit({
  capacity: 10,
  refillRate: 0.05,
  keyPrefix: 'media',
});

// If instructor posts multipart to create with `thumbnail` field, upload it first and attach thumbnailUrl to body
async function handleCreateWithThumbnail(req: any, res: any, next: any) {
  const file = req.file;
  if (!file) return next();
  try {
    const url = await uploadFileStream(file.path, {
      folder: 'courses/thumbnails',
    });
    req.body = req.body || {};
    req.body.thumbnailUrl = url;
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: 'Failed to upload thumbnail' });
  }
}

// Media upload endpoints
/**
 * @swagger
 * /api/courses/{id}/media/thumbnail:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Upload a course thumbnail (multipart form)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Thumbnail uploaded and URL returned
 */
courseRouter.post(
  '/:id/media/thumbnail',
  authenticate,
  requireRole('instructor'),
  mediaRateLimit,
  upload.single('thumbnail'),
  CourseMediaController.uploadThumbnail
);
/**
 * @swagger
 * /api/courses/{id}/media/short-video:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Upload a short preview video for a course
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Short video uploaded and URL returned
 */
courseRouter.post(
  '/:id/media/short-video',
  authenticate,
  requireRole('instructor'),
  mediaRateLimit,
  upload.single('video'),
  CourseMediaController.uploadShortVideo
);

// Allow creating a course with a thumbnail file in the same multipart request
/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a new course (instructor). Accepts JSON or multipart/form-data when uploading thumbnail.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreate'
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priceCents:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Course created
 */
courseRouter.post(
  '/',
  authenticate,
  requireRole('instructor'),
  upload.single('thumbnail'),
  handleCreateWithThumbnail,
  validate(courseCreateSchema),
  CourseController.create
);
