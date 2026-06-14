import { Router } from 'express';
import { getDashboard, searchRecords, getAuditEvents, getAnalyticsSummary, exportReport } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';
import { roleGuard } from '../../auth/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/search', searchRecords);
router.get('/admin/audit-events', roleGuard(['career_content_admin']), getAuditEvents);
router.get('/admin/analytics/summary', roleGuard(['career_content_admin']), getAnalyticsSummary);
router.post('/reports/export', roleGuard(['placement_officer']), exportReport);

export default router;
