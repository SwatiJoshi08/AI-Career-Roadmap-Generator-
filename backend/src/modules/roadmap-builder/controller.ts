import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { Roadmap } from '../../database/models/Roadmap';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export const createRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const roadmapData = { ...req.body, userId, createdBy: userId };
    const roadmap = await Roadmap.create(roadmapData);

    return res.status(201).json({
      data: roadmap,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
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

    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId });
    if (!roadmap) {
      return errorResponse(res, 404, 'Roadmap not found');
    }

    return res.status(200).json({
      data: roadmap,
      meta: getMeta(req),
      error: null,
    });
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
