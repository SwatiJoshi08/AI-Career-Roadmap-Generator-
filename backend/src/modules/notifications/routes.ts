import { Router } from 'express';
import { getNotifications, markAsRead } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);

export default router;
