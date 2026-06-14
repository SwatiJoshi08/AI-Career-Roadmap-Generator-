import { Router } from 'express';
import { getDashboard, searchRecords, getAuditEvents, getAnalyticsSummary, exportReport } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/search', searchRecords);
router.get('/admin/audit-events', getAuditEvents);
router.get('/admin/analytics/summary', getAnalyticsSummary);
router.post('/reports/export', exportReport);

export default router;
