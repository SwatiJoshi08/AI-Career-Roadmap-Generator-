import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const gapAnalysisQueue = new Queue('gap-analysis-queue', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const embeddingQueue = new Queue('embedding-generation-queue', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const linkHealthQueue = new Queue('link-health-check-queue', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});
