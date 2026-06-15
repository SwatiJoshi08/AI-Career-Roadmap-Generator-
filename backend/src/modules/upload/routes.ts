import { Router } from 'express';
import { authMiddleware } from '../../auth/authMiddleware';
import { upload, handleMulterError } from '../../middleware/uploadMiddleware';
import { uploadEvidence } from './controller';

const router = Router();

router.post('/upload/evidence', authMiddleware, upload.single('file'), uploadEvidence);
router.use(handleMulterError);

export default router;
