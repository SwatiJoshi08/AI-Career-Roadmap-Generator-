import { Router } from 'express';
import { register, login, getMe, updateMe } from './auth.controller';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

export default router;
