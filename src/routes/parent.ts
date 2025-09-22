import { Request, Response, Router } from 'express';
import { ParentController } from '../controllers/ParentController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import rateLimiter from '../utils/rateLimiter';
import { validate } from '../validate';
import { emailBodySchema } from '../validate/common';
import {
  createChildSchema,
  linkChildSchema,
  parentLoginSchema,
  parentRegisterSchema,
} from '../validate/parent';

export const parentRouter = Router();

/**
 * @swagger
 * /api/parents/register:
 *   post:
 *     tags:
 *       - Parents
 *     summary: Register a new parent
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
 *         description: Parent registered successfully
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
parentRouter.post(
  '/register',
  validate(parentRegisterSchema),
  async (req: Request, res: Response) => {
    const { ParentController } = await import(
      '../controllers/ParentController'
    );
    return ParentController.register(req, res);
  }
);

/**
 * @swagger
 * /api/parents/verify/{token}:
 *   get:
 *     tags:
 *       - Parents
 *     summary: Verify a parent's email using token
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
parentRouter.get('/verify/:token', async (req: Request, res: Response) => {
  const { ParentController } = await import('../controllers/ParentController');
  return ParentController.verify(req, res);
});

/**
 * @swagger
 * /api/parents/login:
 *   post:
 *     tags:
 *       - Parents
 *     summary: Parent login
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
parentRouter.post(
  '/login',
  validate(parentLoginSchema),
  async (req: Request, res: Response) => {
    const { ParentController } = await import(
      '../controllers/ParentController'
    );
    return ParentController.login(req, res);
  }
);

/**
 * @swagger
 * /api/parents/link:
 *   post:
 *     tags:
 *       - Parents
 *     summary: Link an existing child to a parent by child code
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childCode
 *             properties:
 *               childCode:
 *                 type: string
 *               relationship:
 *                 type: string
 *     responses:
 *       200:
 *         description: Child linked successfully
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
parentRouter.post(
  '/link',
  authenticate,
  requireRole('parent'),
  validate(linkChildSchema),
  ParentController.linkChild
);

/**
 * @swagger
 * /api/parents/children:
 *   post:
 *     tags:
 *       - Parents
 *     summary: Create a child account and link it to parent (sends invite if email provided)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Child created and invite sent
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
parentRouter.post(
  '/children',
  authenticate,
  requireRole('parent'),
  validate(createChildSchema),
  ParentController.createChild
);

/**
 * @swagger
 * /api/parents/resend-verification:
 *   post:
 *     tags:
 *       - Parents
 *     summary: Resend email verification for a parent
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
parentRouter.post(
  '/resend-verification',
  rateLimiter(6, 1000 * 60 * 60),
  validate(emailBodySchema),
  ParentController.resendVerification
);

/**
 * @swagger
 * /api/parents/me:
 *   get:
 *     tags:
 *       - Parents
 *     summary: Get currently authenticated parent profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Parent profile
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
parentRouter.get(
  '/me',
  authenticate,
  requireRole('parent'),
  ParentController.me
);
