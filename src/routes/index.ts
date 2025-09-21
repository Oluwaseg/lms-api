import { Router } from 'express';
// auth router removed — using role-specific routers
import { authRouter } from './auth';
import { instructorRouter } from './instructor';
import { parentRouter } from './parent';
import { studentRouter } from './student';

export const router = Router();

router.use('/students', studentRouter);
router.use('/instructors', instructorRouter);
router.use('/parents', parentRouter);
router.use('/auth', authRouter);
