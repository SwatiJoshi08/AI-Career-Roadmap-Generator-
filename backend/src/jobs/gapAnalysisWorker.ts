import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';

export const gapAnalysisWorker = new Worker(
  'gap-analysis-queue',
  async (job: Job) => {
    console.log(`Processing gap analysis job ${job.id}`, job.data);
    // Logic for running gap analysis using AI goes here
    return { success: true };
  },
  { connection: redis as any }
);

gapAnalysisWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

gapAnalysisWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});
