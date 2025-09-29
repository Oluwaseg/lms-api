import { Router } from 'express';
import { EnrollmentController } from '../controllers/EnrollmentController';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const enrollmentRouter = Router({ mergeParams: true });

// enroll a student in a course (free flow)
/**
 * @swagger
 * /api/courses/{courseId}/enroll:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll the authenticated student in a course (free flow)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Enrollment created
 */
enrollmentRouter.post(
  '/',
  authenticate,
  requireRole('student'),
  EnrollmentController.enroll
);

// list my enrollments
/**
 * @swagger
 * /api/courses/{courseId}/enroll/mine:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get enrollments for the authenticated student
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrollments for the student
 */
enrollmentRouter.get(
  '/mine',
  authenticate,
  requireRole('student'),
  EnrollmentController.listMine
);
