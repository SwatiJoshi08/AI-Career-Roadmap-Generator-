import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

/**
 * Placeholder controller for the mentor-review module.
 * Replace each implementation with real business logic later.
 */

// GET /mentor/queue
export const getMentorQueue = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    // TODO: fetch mentor queue data from DB
    return res.status(200).json({
      data: [],
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getMentorQueue error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

// POST /mentor/comment
export const addMentorComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    // TODO: add a comment to a mentor review
    return res.status(201).json({
      data: { success: true },
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('addMentorComment error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
