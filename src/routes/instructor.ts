import { Router } from 'express';
import { InstructorController } from '../controllers/InstructorController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import rateLimiter from '../utils/rateLimiter';
import { validate } from '../validate';
import { emailBodySchema } from '../validate/common';
import {
  instructorChangePasswordSchema,
  instructorLoginSchema,
  instructorRegisterSchema,
  instructorUpdateSchema,
} from '../validate/instructor';

export const instructorRouter = Router();

/**
 * @swagger
 * /api/instructors/register:
 *   post:
 *     tags:
 *       - Instructors
 *     summary: Register a new instructor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Instructor registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 */
instructorRouter.post(
  '/register',
  validate(instructorRegisterSchema),
  InstructorController.register
);

/**
 * @swagger
 * /api/instructors/verify/{token}:
 *   get:
 *     tags:
 *       - Instructors
 *     summary: Verify an instructor's email using token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 */
instructorRouter.get('/verify/:token', InstructorController.verify);

// login
/**
 * @swagger
 * /api/instructors/login:
 *   post:
 *     tags:
 *       - Instructors
 *     summary: Instructor login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TokenData'
 */
instructorRouter.post(
  '/login',
  validate(instructorLoginSchema),
  InstructorController.login
);

/**
 * @swagger
 * /api/instructors/resend-verification:
 *   post:
 *     tags:
 *       - Instructors
 *     summary: Resend email verification for an instructor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email resent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
instructorRouter.post(
  '/resend-verification',
  rateLimiter(6, 1000 * 60 * 60),
  validate(emailBodySchema),
  InstructorController.resendVerification
);

/**
 * @swagger
 * /api/instructors/me:
 *   get:
 *     tags:
 *       - Instructors
 *     summary: Get currently authenticated instructor profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 */
instructorRouter.get(
  '/me',
  authenticate,
  requireRole('instructor'),
  InstructorController.me
);

// Update instructor profile (email cannot be changed here)
instructorRouter.patch(
  '/me',
  authenticate,
  requireRole('instructor'),
  validate(instructorUpdateSchema),
  InstructorController.update
);

// Change password for instructor
instructorRouter.patch(
  '/me/password',
  authenticate,
  requireRole('instructor'),
  validate(instructorChangePasswordSchema),
  InstructorController.changePassword
);
