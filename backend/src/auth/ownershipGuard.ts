import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { ForbiddenError } from '../common/errors';

export const ownershipGuard = (paramName: string = 'userId') => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const targetUserId = req.params[paramName] || req.body[paramName];
    
    // Admin role bypasses ownership checks. Standard users must match their user ID.
    if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
      return next(new ForbiddenError('You do not own this resource'));
    }
    next();
  };
};
