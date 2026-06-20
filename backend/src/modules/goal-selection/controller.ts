import { Request, Response } from 'express';
import crypto from 'crypto';
import { createGoalSchema, updateGoalSchema } from './schema';
import { CareerGoalService } from './service';
import { errorResponse } from '../../utils/errorResponse';
import { stripHtml } from '../../common/sanitize';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const result = await CareerGoalService.getGoals(userId, { page, limit, status });

    return res.status(200).json({
      data: result.goals,
      meta: {
        ...getMeta(req),
        pagination: result.pagination
      },
      error: null,
    });
  } catch (error) {
    console.error('Get goals error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const getGoalById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const result = await CareerGoalService.getGoalById(userId, req.params.id);

    if (result.error) {
      return errorResponse(res, result.code, result.error);
    }

    return res.status(200).json({
      data: result.goal,
      meta: getMeta(req),
      error: null,
    });
  } catch (error) {
    console.error('Get goal by id error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const parsed = createGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    }

    const sanitizedData = {
      title: stripHtml(parsed.data.title),
      description: parsed.data.description ? stripHtml(parsed.data.description) : undefined,
      targetDate: parsed.data.targetDate,
      priority: parsed.data.priority,
      goalType: parsed.data.goalType ? stripHtml(parsed.data.goalType) : undefined,
      occupationCode: parsed.data.occupationCode ? stripHtml(parsed.data.occupationCode) : undefined,
      occupationTitle: parsed.data.occupationTitle ? stripHtml(parsed.data.occupationTitle) : undefined,
    };

    const meta = getMeta(req);
    const result = await CareerGoalService.createGoal(userId, sanitizedData, meta);

    if (result.error) {
      return errorResponse(res, result.code, result.error);
    }

    return res.status(201).json({
      data: result.goal,
      meta,
      error: null,
    });
  } catch (error) {
    console.error('Create goal error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const parsed = updateGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    }

    const sanitizedData = {
      title: parsed.data.title ? stripHtml(parsed.data.title) : undefined,
      description: parsed.data.description ? stripHtml(parsed.data.description) : undefined,
      targetDate: parsed.data.targetDate,
      priority: parsed.data.priority,
      goalType: parsed.data.goalType ? stripHtml(parsed.data.goalType) : undefined,
      status: parsed.data.status ? stripHtml(parsed.data.status) : undefined,
      occupationCode: parsed.data.occupationCode ? stripHtml(parsed.data.occupationCode) : undefined,
      occupationTitle: parsed.data.occupationTitle ? stripHtml(parsed.data.occupationTitle) : undefined,
    };

    const meta = getMeta(req);
    const result = await CareerGoalService.updateGoal(userId, req.params.id, sanitizedData, meta);

    if (result.error) {
      return errorResponse(res, result.code, result.error);
    }

    return res.status(200).json({
      data: result.goal,
      meta,
      error: null,
    });
  } catch (error) {
    console.error('Update goal error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};
