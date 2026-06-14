import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { Roadmap } from '../../database/models/Roadmap';
import { Skill } from '../../database/models/Skill';
import { Notification } from '../../database/models/Notification';
import { RoadmapMilestone } from '../../database/models/RoadmapMilestone';
import { CareerGoal } from '../../database/models/CareerGoal';
import { AnalyticsEvent } from '../../database/models/AnalyticsEvent';

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

    // Search across skills, goals, and roadmaps
    // $regex is used for basic substring matching as fallback or if text indexes are not fully set up.
    const [skills, goals, roadmaps] = await Promise.all([
      Skill.find({
        userId,
        deletedAt: null,
        name: { $regex: q, $options: 'i' },
      }).limit(20),
      CareerGoal.find({
        userId,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { targetRole: { $regex: q, $options: 'i' } }
        ]
      }).limit(20),
      Roadmap.find({
        userId,
        title: { $regex: q, $options: 'i' },
      }).limit(20)
    ]);

    return res.status(200).json({
      data: { skills, goals, roadmaps },
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
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [last7daysRaw, last30daysRaw] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: sevenDaysAgo } } },
        { $group: { _id: "$eventName", count: { $sum: 1 } } }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$eventName", count: { $sum: 1 } } }
      ])
    ]);

    const formatData = (rawData: any[]) => {
      const formatted: Record<string, number> = {};
      rawData.forEach(item => {
        formatted[item._id] = item.count;
      });
      return formatted;
    };

    return res.status(200).json({
      data: {
        last7days: formatData(last7daysRaw),
        last30days: formatData(last30daysRaw)
      },
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
