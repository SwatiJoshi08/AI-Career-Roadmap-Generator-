import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const gapAnalysisQueue = new Queue('gap-analysis-queue', {
  connection: redis as any,
});
