import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { GapAnalysis } from '../../database/models/GapAnalysis';
import { CareerGoal } from '../../database/models/CareerGoal';
import { Skill } from '../../database/models/Skill';
import { gapAnalysisQueue } from '../../jobs/queue';
import { JobStatus } from '../../database/models/enums';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

/* POST /gapanalysis */
export const createGapAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const { careerGoalId } = req.body;
    if (!careerGoalId) {
      return errorResponse(res, 400, 'careerGoalId is required');
    }

    // Validate careerGoalId exists and belongs to the requesting user
    const goal = await CareerGoal.findOne({ _id: careerGoalId, userId });
    if (!goal) {
      return errorResponse(res, 404, 'Career goal not found or does not belong to you');
    }

    // Fetch user's active skills
    const skills = await Skill.find({ userId, deletedAt: null });

    // Create GapAnalysis record with jobStatus "queued"
    const gapAnalysis = await GapAnalysis.create({
      userId,
      careerGoalId,
      identifiedGaps: [],
      aiGenerated: false,
      jobStatus: JobStatus.QUEUED,
      fallbackUsed: false,
      requestTimestamp: new Date(),
      createdBy: userId,
    });

    // Enqueue job to BullMQ gap-analysis-queue
    await gapAnalysisQueue.add('process', {
      gapAnalysisId: gapAnalysis._id.toString(),
      userId,
      careerGoalId,
      skills: skills.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        category: s.category,
        proficiencyLevel: s.proficiencyLevel,
      })),
    });

    return res.status(201).json({
      data: gapAnalysis,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('createGapAnalysis error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/* GET /gapanalysis */
export const getGapAnalyses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const analyses = await GapAnalysis.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      data: analyses,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getGapAnalyses error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/* GET /gapanalysis/:id/status */
export const getGapAnalysisStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const analysis = await GapAnalysis.findOne({ _id: req.params.id, userId });
    if (!analysis) {
      return errorResponse(res, 404, 'Gap analysis not found or does not belong to you');
    }

    return res.status(200).json({
      data: {
        id: analysis._id,
        jobStatus: analysis.jobStatus,
        fallbackUsed: analysis.fallbackUsed,
      },
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getGapAnalysisStatus error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/* GET /gapanalysis/:id */
export const getGapAnalysisById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const analysis = await GapAnalysis.findOne({ _id: req.params.id, userId });
    if (!analysis) {
      return errorResponse(res, 404, 'Gap analysis not found or does not belong to you');
    }

    return res.status(200).json({
      data: analysis,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getGapAnalysisById error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
