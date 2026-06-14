import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/errorResponse';
import { AuditLog } from '../database/models/AuditLog';

export const roleGuard = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized: User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Create Audit Log
      await AuditLog.create({
        actor: req.user.userId,
        actorEmail: req.user.email,
        action: 'unauthorized_access_attempt',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date(),
      });

      return errorResponse(res, 403, 'Forbidden: Insufficient permissions');
    }

    return next();
  };
};
