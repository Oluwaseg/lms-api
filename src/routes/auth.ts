import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';

export const authRouter = Router();

// Deprecated: auth endpoints have been replaced by role-specific routers
authRouter.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
  ],
  AuthController.login
);

// Keep fallback for any other deprecated auth endpoints
authRouter.use((req, res) => {
  res.status(410).json({
    success: false,
    message: 'Deprecated: use /students or /instructors or /parents',
  });
});
