import { Router } from 'express';
import { getMe, createProfile, updateProfile } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';
import { roleGuard } from '../../auth/roleGuard';
import { Role } from '../../database/models';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.post('/', authMiddleware, roleGuard([Role.STUDENT]), createProfile);
router.patch('/:id', authMiddleware, updateProfile);

export default router;
