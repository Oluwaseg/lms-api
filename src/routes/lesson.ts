import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { LessonController } from '../controllers/LessonController';
import { LessonMediaController } from '../controllers/LessonMediaController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../validate';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

function videoFilter(req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video files are allowed'), false);
}

// small inline validations for lessons
const lessonCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().optional(),
    position: z.number().optional(),
    durationSeconds: z.number().optional(),
  }),
});

export const lessonRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /api/courses/{courseId}/lessons:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Create a lesson for a course
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               position:
 *                 type: number
 *               durationSeconds:
 *                 type: number
 *     responses:
 *       201:
 *         description: Lesson created
 */
lessonRouter.post(
  '/',
  authenticate,
  requireRole('instructor'),
  validate(lessonCreateSchema),
  LessonController.create
);
/**
 * @swagger
 * /api/courses/{courseId}/lessons:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: List lessons for a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lessons list
 */
lessonRouter.get('/', LessonController.list);

// Upload a video for an existing lesson
lessonRouter.post(
  '/:lessonId/media/video',
  authenticate,
  requireRole('instructor'),
  upload.single('video'),
  LessonMediaController.uploadVideo
);

/**
 * @swagger
 * /api/courses/{courseId}/lessons/{lessonId}/media/video:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Upload a lesson video (multipart)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
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
 *         description: Lesson video uploaded
 */
