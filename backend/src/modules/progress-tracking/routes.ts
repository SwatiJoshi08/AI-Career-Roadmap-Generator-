import { Router } from 'express';
import { createProgress, getProgress } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/progress', createProgress);
router.get('/progress', getProgress);

export default router;
