import { Router } from 'express';
import { getSkills, createSkill, updateSkill, addEvidence } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.patch('/skills/:id', updateSkill);
router.post('/skills/:id/evidence', addEvidence);

export default router;