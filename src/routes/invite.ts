import { Router } from 'express';
import { InviteController } from '../controllers/InviteController';
import rateLimiter from '../utils/rateLimiter';
import { validate } from '../validate';
import { acceptInviteSchema, validateInviteSchema } from '../validate/invite';

export const inviteRouter = Router();

/**
 * @swagger
 * /api/invites/validate:
 *   get:
 *     tags:
 *       - Invites
 *     summary: Validate an invite token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
inviteRouter.get(
  '/validate',
  validate(validateInviteSchema),
  InviteController.validate
);

/**
 * @swagger
 * /api/invites/complete:
 *   post:
 *     tags:
 *       - Invites
 *     summary: Accept an invite and set password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Invite accepted (optionally returns JWT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
inviteRouter.post(
  '/complete',
  rateLimiter(10, 1000 * 60 * 60),
  validate(acceptInviteSchema),
  InviteController.accept
);
