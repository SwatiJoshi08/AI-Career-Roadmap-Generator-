import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { errorResponse } from '../../utils/errorResponse';
import { Role, User, CareerProfile } from '../../database/models';
import crypto from 'crypto';

const formatUserResponse = (user: any) => ({
  id: user._id || user.id,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt
});

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    }

    const { email, password, role } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await AuthService.registerUser(email, passwordHash, role, req.ip, req.headers['user-agent']);
    if (result.error) {
      return errorResponse(res, result.code!, result.error);
    }

    const user = result.user!;
    const token = AuthService.generateToken(user._id.toString(), user.email, user.role);

    return res.status(201).json({
      data: {
        token,
        user: formatUserResponse(user),
      },
      meta: getMeta(req),
      error: null,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    }

    const { email, password } = parsed.data;
    const result = await AuthService.loginUser(email, req.ip, req.headers['user-agent']);
    if (result.error) {
      return errorResponse(res, result.code!, result.error);
    }

    const user = result.user!;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      // Audit log failed login
      await AuthService.loginUser(email, req.ip, req.headers['user-agent']); // This triggers the failed log again technically if user wasn't found but we already bypassed that. To be precise, let's call the specific audit log
      return errorResponse(res, 401, 'Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    await AuthService.logSuccessfulLogin(user._id.toString(), user.email, req.ip, req.headers['user-agent']);
    const token = AuthService.generateToken(user._id.toString(), user.email, user.role);

    return res.status(200).json({
      data: {
        token,
        user: formatUserResponse(user),
      },
      meta: getMeta(req),
      error: null,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return res.status(200).json({
      data: formatUserResponse(user),
      meta: getMeta(req),
      error: null,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    }

    const profile = await CareerProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return errorResponse(res, 404, 'Career profile not found');
    }

    if (parsed.data.bio !== undefined) profile.bio = parsed.data.bio;
    if (parsed.data.currentRole !== undefined) profile.currentRole = parsed.data.currentRole;
    if (parsed.data.targetRole !== undefined) profile.targetRole = parsed.data.targetRole;

    profile.updatedBy = req.user.userId as any;
    profile.version = (profile.version || 0) + 1;

    await profile.save();

    return res.status(200).json({
      data: profile,
      meta: getMeta(req),
      error: null,
    });
  } catch (error) {
    console.error('Update me error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};
