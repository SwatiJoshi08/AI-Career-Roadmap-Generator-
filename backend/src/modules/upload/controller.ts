import { Request, Response } from 'express';
import crypto from 'crypto';
import { uploadFile } from '../../integrations/cloudinary/cloudinaryService';
import { errorResponse } from '../../utils/errorResponse';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export const uploadEvidence = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) return errorResponse(res, 401, 'Unauthorized');
    if (!req.file) return errorResponse(res, 400, 'Validation Error', 'File is required');

    const result = await uploadFile(req.file.buffer, req.file.originalname, 'acrg/evidence');

    return res.status(201).json({
      data: result,
      meta: getMeta(req),
      error: null,
    });
  } catch (e: any) {
    if (e.statusCode) {
      return res.status(e.statusCode).json({
        data: null,
        meta: getMeta(req),
        error: {
          code: e.message,
          message: e.message,
          details: e.details || null,
        },
      });
    }

    console.error('uploadEvidence error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
