import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorResponse } from './common/response';
import { AppError } from './common/errors';
import authRoutes from './modules/auth/routes';
import careerProfileRoutes from './modules/career-profile/routes';
import careerGoalRoutes from './modules/goal-selection/routes';
import skillRoutes from './modules/skill-inventory/routes';
import gapAnalysisRoutes from './modules/gap-analysis/routes';
import roadmapRoutes from './modules/roadmap-builder/routes';
import progressRoutes from './modules/progress-tracking/routes';
import mentorRoutes from './modules/mentor-review/routes';
import notificationRoutes from './modules/notifications/routes';
import dashboardRoutes from './modules/admin/routes';
import uploadRoutes from './modules/upload/routes';
import onetRoutes from './modules/onet/onet.routes';
import { linkHealthQueue } from './jobs/queue';

// Schedule repeatable weekly job (Sunday 03:00)
(async () => {
  await linkHealthQueue.add(
    'weekly-health-check',
    {}, // no payload
    {
      repeat: { pattern: '0 3 * * 0' }, // cron syntax
      removeOnComplete: true,
    }
  );
})();

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

// Rate Limiting on authentication routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api/', generalLimiter);

app.use('/api/v1/acrg/auth', authRateLimiter);
app.use('/api/v1/acrg/auth', authRoutes);
app.use('/api/v1/acrg', skillRoutes);
app.use('/api/v1/acrg', gapAnalysisRoutes);
app.use('/api/v1/acrg', roadmapRoutes);
app.use('/api/v1/acrg', progressRoutes);
app.use('/api/v1/acrg', mentorRoutes);
app.use('/api/v1/acrg', notificationRoutes);
app.use('/api/v1/acrg', dashboardRoutes);
app.use('/api/v1/acrg', uploadRoutes);
app.use('/api/v1/acrg', onetRoutes);
// ✅ Career Profile Routes
app.use('/api/v1/acrg', careerProfileRoutes);
// ✅ Career Goal Routes (now after specific routes)
app.use('/api/v1/acrg', careerGoalRoutes);


// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }
  console.error('[Unhandled Exception]:', err);
  return res.status(500).json(
    errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
  );
});

export default app;
