import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/errorResponse';
import mongoose from 'mongoose';

/**
 * Factory function to create an ownership guard middleware.
 * @param model Mongoose model to check
 * @param paramName the param name in req.params containing the document ID
 */
export const ownershipGuard = (model: mongoose.Model<any>, paramName: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized: User not authenticated');
    }

    const docId = req.params[paramName];
    if (!docId) {
      return errorResponse(res, 400, `Bad Request: Missing parameter ${paramName}`);
    }

    try {
      const doc = await model.findById(docId);
      if (!doc) {
        return errorResponse(res, 404, 'Not Found: Document not found');
      }

      if (doc.createdBy?.toString() !== req.user.userId) {
        return errorResponse(res, 403, 'Forbidden: You do not own this document');
      }

      return next();
    } catch (error) {
      return errorResponse(res, 500, 'Internal Server Error while checking ownership');
    }
  };
};
