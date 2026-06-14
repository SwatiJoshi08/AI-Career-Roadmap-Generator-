import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { GapAnalysis } from '../database/models/GapAnalysis';
import { CareerGoal } from '../database/models/CareerGoal';
import { Skill } from '../database/models/Skill';
import { CareerProfile } from '../database/models/CareerProfile';
import { generateCareerPathway } from '../integrations/ai/aiService';
import { generateFallbackPathway } from '../integrations/ai/aiFallback';
import { config } from '../config/env';
import { JobStatus } from '../database/models/enums';

export const gapAnalysisWorker = new Worker(
  'gap-analysis-queue',
  async (job: Job) => {
    const { gapAnalysisId } = job.data;
    if (!gapAnalysisId) throw new Error('Missing gapAnalysisId');

    console.log('[Worker] Gap analysis job started:', gapAnalysisId);

    const gapAnalysis = await GapAnalysis.findById(gapAnalysisId);
    if (!gapAnalysis) throw new Error('GapAnalysis not found');

    gapAnalysis.jobStatus = JobStatus.PROCESSING;
    await gapAnalysis.save();

    try {
      const careerGoal = await CareerGoal.findById(gapAnalysis.careerGoalId);
      if (!careerGoal) throw new Error('CareerGoal not found');

      const skills = await Skill.find({ userId: gapAnalysis.userId });
      const careerProfile = await CareerProfile.findOne({ userId: gapAnalysis.userId });

      const currentRole = careerProfile?.currentRole || 'Student';
      const targetRole = careerProfile?.targetRole || careerGoal.title;

      const input = {
        currentRole,
        targetRole,
        currentSkills: skills.map((s) => s.name),
        identifiedGaps: gapAnalysis.identifiedGaps.map((g) => g.skillName),
        availableHoursPerWeek: 10,
        targetDate: careerGoal.targetDate?.toISOString() || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log('[Worker] Input built:', JSON.stringify(input));
      console.log('[Worker] Calling Gemini API...');

      const result = await generateCareerPathway(input);
      console.log('[Worker] AI result received');

      gapAnalysis.aiResult = result.result as any;
      gapAnalysis.aiGenerated = true;
      gapAnalysis.jobStatus = JobStatus.COMPLETED;
      gapAnalysis.modelName = result.modelName;
      gapAnalysis.promptVersion = result.promptVersion;
      gapAnalysis.requestTimestamp = result.requestTimestamp;
      gapAnalysis.responseTimestamp = result.responseTimestamp;
      
      await gapAnalysis.save();
      return { success: true, aiGenerated: true };

    } catch (error: any) {
      console.error('[Worker] Error occurred:', error.message);
      // Always use fallback on any error
      const fallbackResult = generateFallbackPathway(gapAnalysis.identifiedGaps.length);
      gapAnalysis.aiResult = fallbackResult as any;
      gapAnalysis.fallbackUsed = true;
      gapAnalysis.jobStatus = JobStatus.COMPLETED_WITH_FALLBACK;
      gapAnalysis.aiGenerated = false;
      await gapAnalysis.save();
      
      return { success: true, aiGenerated: false, fallbackUsed: true };
    }
  },
  { 
    connection: redis as any,
    concurrency: 2
  }
);

gapAnalysisWorker.on('completed', (job) => {
  if (config.LOG_LEVEL === 'debug') {
    console.log(`Job ${job.id} completed successfully`);
  }
});

gapAnalysisWorker.on('failed', (job, err) => {
  if (config.LOG_LEVEL === 'debug') {
    console.error(`Job ${job?.id} failed in worker wrapper:`, err);
  }
});
