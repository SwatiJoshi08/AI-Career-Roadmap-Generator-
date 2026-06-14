import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { Roadmap } from '../../database/models/Roadmap';
import { Skill } from '../../database/models/Skill';
import { Notification } from '../../database/models/Notification';
import { RoadmapMilestone } from '../../database/models/RoadmapMilestone';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

/* GET /dashboard */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    // Fetch all user roadmap IDs first (for milestone query)
    const userRoadmaps = await Roadmap.find({ userId }).select('_id');
    const roadmapIds = userRoadmaps.map((r) => r._id);

    const [activeRoadmaps, skillCount, unreadNotifications, pendingMilestones] =
      await Promise.all([
        Roadmap.countDocuments({ userId, status: 'active' }),
        Skill.countDocuments({ userId, deletedAt: null }),
        Notification.countDocuments({ userId, isRead: false }),
        RoadmapMilestone.countDocuments({
          roadmapId: { $in: roadmapIds },
          completedAt: null,
        }),
      ]);

    return res.status(200).json({
      data: { activeRoadmaps, skillCount, unreadNotifications, pendingMilestones },
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getDashboard error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/* GET /search */
export const searchRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return errorResponse(res, 400, 'Query parameter "q" is required');
    }

    // Search across skills by text index
    const skills = await Skill.find({
      userId,
      deletedAt: null,
      $text: { $search: q },
    }).limit(20);

    return res.status(200).json({
      data: { skills },
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('searchRecords error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/* GET /admin/audit-events */
export const getAuditEvents = async (req: Request, res: Response) => {
  void req;
  try {
    // TODO: fetch audit events (requires admin role)
    return res.status(200).json({
      data: [],
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getAuditEvents error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/* GET /admin/analytics/summary */
export const getAnalyticsSummary = async (req: Request, res: Response) => {
  void req;
  try {
    // TODO: compute analytics summary (requires admin role)
    return res.status(200).json({
      data: null,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getAnalyticsSummary error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/* POST /reports/export */
export const exportReport = async (req: Request, res: Response) => {
  void req;
  try {
    // TODO: generate and send a report file
    return res.status(200).json({
      data: { exported: true },
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('exportReport error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
