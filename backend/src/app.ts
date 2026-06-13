import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorResponse } from './common/response';
import { AppError } from './common/errors';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);

// Logging Middleware
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Parse Body Middleware
app.use(express.json());

// Rate Limiting on authentication routes: 10 requests per 15 minutes per IP
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again after 15 minutes',
  handler: (_req: Request, res: Response, _next: NextFunction, options) => {
    res.status(429).json(
      errorResponse('TOO_MANY_REQUESTS', options.message, null)
    );
  },
});

app.use('/api/v1/acrg/auth', authRateLimiter);

// Simple Healthcheck Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Global Error Handler Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // If it's a known application error, format and return it
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }

  // Otherwise log the unexpected error and return 500
  console.error('[Unhandled Exception]:', err);
  return res.status(500).json(
    errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
  );
});

export default app;
