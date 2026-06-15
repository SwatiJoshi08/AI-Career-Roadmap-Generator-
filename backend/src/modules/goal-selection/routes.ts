import { Router } from 'express';
import { getGoals, getGoalById, createGoal, updateGoal } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';
import { idempotencyMiddleware } from '../../common/idempotency';

const router = Router();

router.use(authMiddleware);

router.get('/careergoal', getGoals);
router.post('/careergoal', idempotencyMiddleware, createGoal);
router.get('/careergoal/:id', getGoalById);
router.patch('/careergoal/:id', updateGoal);

export default router;