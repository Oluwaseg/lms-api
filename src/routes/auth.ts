import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../validate';
import { authLoginSchema } from '../validate/auth';

export const authRouter = Router();

// Deprecated: auth endpoints have been replaced by role-specific routers
authRouter.post('/login', validate(authLoginSchema), AuthController.login);

// Keep fallback for any other deprecated auth endpoints
authRouter.use((req, res) => {
  res.status(410).json({
    success: false,
    message: 'Deprecated: use /students or /instructors or /parents',
  });
});
