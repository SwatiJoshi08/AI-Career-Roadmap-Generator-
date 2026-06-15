import { Router } from 'express';
import { createRoadmap, getRoadmaps, getRoadmapById, activateRoadmap } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';
import { idempotencyMiddleware } from '../../common/idempotency';

const router = Router();

router.use(authMiddleware);

router.post('/roadmap', idempotencyMiddleware, createRoadmap);
router.get('/roadmap', getRoadmaps);
router.get('/roadmap/:id', getRoadmapById);
router.patch('/roadmap/:id/activate', activateRoadmap);

export default router;
