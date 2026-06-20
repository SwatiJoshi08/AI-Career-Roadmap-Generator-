import { Router } from 'express';
import { getDashboard, searchRecords, getAuditEvents, getAnalyticsSummary, exportReport, rebuildEmbeddings, getBrokenLinks } from './controller';
import { authMiddleware } from '../../auth/authMiddleware';
import { roleGuard } from '../../auth/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/search', searchRecords);
router.get('/admin/audit-events', roleGuard(['career_content_admin']), getAuditEvents);
router.get('/admin/analytics/summary', roleGuard(['career_content_admin']), getAnalyticsSummary);
router.post('/admin/rebuild-embeddings', roleGuard(['career_content_admin']), rebuildEmbeddings);
router.post('/reports/export', roleGuard(['placement_officer']), exportReport);
router.get('/admin/broken-links', roleGuard(['career_content_admin']), getBrokenLinks);

export default router;
