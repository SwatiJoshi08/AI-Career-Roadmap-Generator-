import { Router } from 'express';
import { getMentorQueue, addMentorComment } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';
import { roleGuard } from '../../auth/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/mentor/queue', roleGuard(['career_mentor']), getMentorQueue);
router.post('/mentor/comment', roleGuard(['career_mentor']), addMentorComment);

export default router;
