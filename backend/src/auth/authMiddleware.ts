import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/errorResponse';
import { Role } from '../database/models/enums';

export interface DecodedToken {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Unauthorized: Missing or invalid token format');
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return errorResponse(res, 500, 'Internal server error');
    }

    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    req.user = decoded;
    return next();
  } catch (error) {
    return errorResponse(res, 401, 'Unauthorized: Invalid or expired token');
  }
};
