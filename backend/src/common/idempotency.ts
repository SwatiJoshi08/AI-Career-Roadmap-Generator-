import { redis } from '../config/redis';
import { Request, Response, NextFunction } from 'express';

export const idempotencyMiddleware = async (
  req: Request, res: Response, next: NextFunction
) => {
  const key = req.headers['idempotency-key'] as string;
  if (!key) return next();
  const cacheKey = `idempotency:${key}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const { status, body } = JSON.parse(cached);
      return res.status(status).json(body);
    }
  } catch (err) {
    console.error('Idempotency Redis get error:', err);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    try {
      redis.setex(cacheKey, 86400, JSON.stringify({ 
        status: res.statusCode, 
        body 
      }));
    } catch (err) {
      console.error('Idempotency Redis set error:', err);
    }
    return originalJson(body);
  };
  next();
};
