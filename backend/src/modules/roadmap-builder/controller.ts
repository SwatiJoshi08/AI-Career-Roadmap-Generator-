import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { Roadmap } from '../../database/models/Roadmap';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

import { GapAnalysis } from '../../database/models/GapAnalysis';
import { CareerGoal } from '../../database/models/CareerGoal';
import { RoadmapMilestone } from '../../database/models/RoadmapMilestone';
import { successResponse } from '../../common/response';

export const createRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const { gapAnalysisId } = req.body;
    if (!gapAnalysisId) return errorResponse(res, 400, 'gapAnalysisId is required');

    // 1. Fetch GapAnalysis & verify ownership
    const gapAnalysis = await GapAnalysis.findOne({ _id: gapAnalysisId, userId });
    if (!gapAnalysis) {
      return errorResponse(res, 404, 'Gap analysis not found');
    }

    // 2. Fetch CareerGoal using gapAnalysis.careerGoalId
    let careerGoalTitle = 'Career Goal';
    if (gapAnalysis.careerGoalId) {
      const careerGoal = await CareerGoal.findOne({ _id: gapAnalysis.careerGoalId, userId });
      if (careerGoal) {
        careerGoalTitle = careerGoal.title;
      }
    }

    // 3. Get aiResult and phases
    const aiResult = gapAnalysis.aiResult as any;
    const phases = aiResult?.phases || [];

    // 4. Create Roadmap record
    const roadmap = await Roadmap.create({
      userId: userId,
      gapAnalysisId: gapAnalysis._id,
      careerGoalId: gapAnalysis.careerGoalId,
      title: `Roadmap for ${careerGoalTitle}`,
      estimatedDuration: aiResult?.totalWeeks || 12,
      completionPercentage: 0,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId
    });

    // 5. Create RoadmapMilestone for each milestone in each phase
    let orderIndex = 0;
    for (const phase of phases) {
      for (const milestone of (phase.milestones || [])) {
        await RoadmapMilestone.create({
          roadmapId: roadmap._id,
          title: typeof milestone === 'string' ? milestone : (milestone.title || 'Milestone'),
          description: milestone.description || '',
          orderIndex: orderIndex++,
          createdBy: userId,
          updatedBy: userId
        });
      }
    }

    const meta = getMeta(req);
    return res.status(201).json(successResponse(roadmap, meta));
  } catch (e: any) {
    console.error('createRoadmap error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const getRoadmaps = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      data: roadmaps,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getRoadmaps error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const getRoadmapById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const id = req.params.id;
    const roadmap = await Roadmap.findById(id).lean();
    if (!roadmap) {
      return errorResponse(res, 404, 'Roadmap not found');
    }
    if (roadmap.userId.toString() !== userId) {
      return errorResponse(res, 403, 'Forbidden');
    }

    const milestones = await RoadmapMilestone.find({ 
      roadmapId: roadmap._id,
      deletedAt: null 
    }).sort({ orderIndex: 1 }).lean();

    const meta = getMeta(req);
    return res.status(200).json(successResponse({
      ...roadmap,
      milestones
    }, meta));
  } catch (e) {
    console.error('getRoadmapById error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const activateRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: 'active', activatedAt: new Date() },
      { new: true }
    );

    if (!roadmap) {
      return errorResponse(res, 404, 'Roadmap not found');
    }

    return res.status(200).json({
      data: roadmap,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('activateRoadmap error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
