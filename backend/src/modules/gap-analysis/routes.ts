import { Router } from 'express';
import {
    createGapAnalysis,
    getGapAnalyses,
    getGapAnalysisStatus,
    getGapAnalysisById,
} from './controller';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Status must be before generic :id
router.get('/gapanalysis/:id/status', getGapAnalysisStatus);
router.get('/gapanalysis/:id', getGapAnalysisById);
router.get('/gapanalysis', getGapAnalyses);
router.post('/gapanalysis', createGapAnalysis);

export default router;
