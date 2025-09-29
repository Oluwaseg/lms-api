import { Router } from 'express';
// auth router removed — using role-specific routers
import { authRouter } from './auth';
import { courseRouter } from './course';
import { instructorRouter } from './instructor';
import { inviteRouter } from './invite';
import { parentRouter } from './parent';
import { studentRouter } from './student';

export const router = Router();

router.use('/students', studentRouter);
router.use('/instructors', instructorRouter);
router.use('/parents', parentRouter);
router.use('/invites', inviteRouter);
router.use('/auth', authRouter);
router.use('/courses', courseRouter);
// cloudinary sign endpoint removed; we use a single account and server-side uploads
