import { Request, Response } from 'express';
import crypto from 'crypto';
import { createProfileSchema, updateProfileSchema } from './schema';
import { CareerProfileService } from './service';
import { errorResponse } from '../../utils/errorResponse';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const profile = await CareerProfileService.getProfile(userId);
    if (!profile) return errorResponse(res, 404, 'Career profile not found');

    return res.status(200).json({
      data: profile,
      meta: getMeta(req),
      error: null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const parsed = createProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    }

    const meta = getMeta(req);
    const result = await CareerProfileService.createProfile(userId, parsed.data, meta);

    if (result.error) {
      return errorResponse(res, result.code, result.error);
    }

    return res.status(201).json({
      data: result.profile,
      meta,
      error: null,
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    }

    const profileId = req.params.id;
    // Ownership check via service since service uses findByUserId
    const existingProfile = await CareerProfileService.getProfile(userId);
    if (!existingProfile || existingProfile._id.toString() !== profileId) {
       return errorResponse(res, 403, 'You do not have permission to update this profile');
    }

    const meta = getMeta(req);
    const result = await CareerProfileService.updateProfile(userId, parsed.data, meta);

    if (result.error) {
      return errorResponse(res, result.code, result.error);
    }

    return res.status(200).json({
      data: result.profile,
      meta,
      error: null,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};
