import { Request, Response } from 'express';
import crypto from 'crypto';
import { createSkillSchema, updateSkillSchema, addEvidenceSchema } from './schema';
import { skillService } from './service';
import { errorResponse } from '../../utils/errorResponse';
import { stripHtml } from '../../common/sanitize';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export const getSkills = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');
    const { category, proficiencyLevel } = req.query as any;
    const result = await skillService.listSkills(userId, { category, proficiencyLevel });
    return res.status(200).json({ data: result, meta: getMeta(req), error: null });
  } catch (e) {
    console.error('Get skills error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');
    const parsed = createSkillSchema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    
    const sanitizedData = {
      name: stripHtml(parsed.data.name),
      category: parsed.data.category ? stripHtml(parsed.data.category) : undefined,
      proficiencyLevel: parsed.data.proficiencyLevel,
      isVerified: parsed.data.isVerified
    };

    const meta = getMeta(req);
    const result = await skillService.createSkill(userId, sanitizedData, meta);
    return res.status(201).json({ data: result, meta, error: null });
  } catch (e: any) {
    console.error('Create skill error:', e);
    if (e.statusCode) {
      return errorResponse(res, e.statusCode, e.message);
    }
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');
    const parsed = updateSkillSchema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    const skillId = req.params.id;
    
    const sanitizedData = {
      name: parsed.data.name ? stripHtml(parsed.data.name) : undefined,
      category: parsed.data.category ? stripHtml(parsed.data.category) : undefined,
      proficiencyLevel: parsed.data.proficiencyLevel,
      isVerified: parsed.data.isVerified
    };

    const meta = getMeta(req);
    const result = await skillService.updateSkill(userId, skillId, sanitizedData, meta);
    return res.status(200).json({ data: result, meta, error: null });
  } catch (e: any) {
    console.error('Update skill error:', e);
    if (e.statusCode) {
      return errorResponse(res, e.statusCode, e.message);
    }
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const addEvidence = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');
    const parsed = addEvidenceSchema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, 400, 'Validation Error', parsed.error.errors);
    const skillId = req.params.id;
    
    const sanitizedData = {
      evidenceType: parsed.data.evidenceType ? stripHtml(parsed.data.evidenceType) : undefined,
      evidenceUrl: parsed.data.evidenceUrl ? stripHtml(parsed.data.evidenceUrl) : undefined,
      description: parsed.data.description ? stripHtml(parsed.data.description) : undefined,
      verifiedAt: parsed.data.verifiedAt
    };

    const meta = getMeta(req);
    const result = await skillService.addEvidence(userId, skillId, sanitizedData, meta);
    return res.status(201).json({ data: result, meta, error: null });
  } catch (e: any) {
    console.error('Add evidence error:', e);
    if (e.statusCode) {
      return errorResponse(res, e.statusCode, e.message);
    }
    return errorResponse(res, 500, 'Internal server error');
  }
};
