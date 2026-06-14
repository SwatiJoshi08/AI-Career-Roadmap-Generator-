import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { ProgressUpdate } from '../../database/models/ProgressUpdate';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

// POST /progress
export const createProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const progressData = { ...req.body, userId, createdBy: userId };
    const progress = await ProgressUpdate.create(progressData);

    return res.status(201).json({
      data: progress,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('createProgress error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

// GET /progress
export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const progress = await ProgressUpdate.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      data: progress,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getProgress error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
