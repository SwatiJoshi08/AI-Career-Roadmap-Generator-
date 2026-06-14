import { Router } from 'express';
import { getMe, createProfile, updateProfile } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';
import { roleGuard } from '../../auth/roleGuard';

const router = Router();

router.get('/career-profile/me', authMiddleware, getMe);
router.post('/career-profile', authMiddleware, roleGuard(['student']), createProfile);
router.patch('/career-profile/me', authMiddleware, updateProfile);

export default router;