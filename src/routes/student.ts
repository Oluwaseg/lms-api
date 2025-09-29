import { Router } from 'express';
import { StudentController } from '../controllers/StudentController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import rateLimiter from '../utils/rateLimiter';
import { validate } from '../validate';
import { emailBodySchema } from '../validate/common';
import {
  studentChangePasswordSchema,
  studentRegisterSchema,
  studentUpdateSchema,
} from '../validate/student';

export const studentRouter = Router();

/**
 * @swagger
 * /api/students/register:
 *   post:
 *     tags:
 *       - Students
 *     summary: Register a new student
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
 *         description: Student registered successfully
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
studentRouter.post(
  '/register',
  validate(studentRegisterSchema),
  StudentController.register
);

/**
 * @swagger
 * /api/students/login:
 *   post:
 *     tags:
 *       - Students
 *     summary: Student login
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
studentRouter.post('/login', StudentController.login);

/**
 * @swagger
 * /api/students/resend-verification:
 *   post:
 *     tags:
 *       - Students
 *     summary: Resend email verification for a student
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
studentRouter.post(
  '/resend-verification',
  rateLimiter(6, 1000 * 60 * 60),
  validate(emailBodySchema),
  StudentController.resendVerification
);

/**
 * @swagger
 * /api/students/me:
 *   get:
 *     tags:
 *       - Students
 *     summary: Get currently authenticated student profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile
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
studentRouter.get(
  '/me',
  authenticate,
  requireRole('student'),
  StudentController.me
);

// Update student profile (email cannot be changed here)
/**
 * @swagger
 * /api/students/me:
 *   patch:
 *     tags:
 *       - Students
 *     summary: Update currently authenticated student profile (email cannot be changed)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
studentRouter.patch(
  '/me',
  authenticate,
  requireRole('student'),
  validate(studentUpdateSchema),
  StudentController.update
);

// Change password for student
/**
 * @swagger
 * /api/students/me/password:
 *   patch:
 *     tags:
 *       - Students
 *     summary: Change password for the authenticated student
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
studentRouter.patch(
  '/me/password',
  authenticate,
  requireRole('student'),
  validate(studentChangePasswordSchema),
  StudentController.changePassword
);

/**
 * @swagger
 * /api/students/verify/{token}:
 *   get:
 *     tags:
 *       - Students
 *     summary: Verify a student's email using token
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
studentRouter.get('/verify-email', StudentController.verify);
