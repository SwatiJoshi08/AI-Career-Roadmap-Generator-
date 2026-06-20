import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { generateEmbedding } from '../integrations/embeddings/embeddingService';
import { CareerKnowledgeChunk } from '../database/models/CareerKnowledgeChunk';
import { OnetOccupation } from '../database/models/OnetOccupation';

export const startEmbeddingWorker = () => {
  const worker = new Worker(
    'embedding-generation-queue',
    async (job: Job) => {
      const { occupationId } = job.data;
      if (!occupationId) return;

      const occupation = await OnetOccupation.findById(occupationId);
      if (!occupation) {
        console.warn(`[EmbeddingWorker] Occupation not found: ${occupationId}`);
        return;
      }

      console.log(`[EmbeddingWorker] Processing occupation ${occupation.occupationCode} - ${occupation.title}`);

      const chunks = [];

      // Description chunk
      chunks.push({
        sourceType: 'occupation_description',
        sourceId: occupation._id,
        title: occupation.title,
        content: occupation.description,
      });

      // Skills chunks
      if (occupation.skills) {
        for (const skill of occupation.skills) {
          chunks.push({
            sourceType: 'occupation_skill',
            sourceId: occupation._id,
            title: `${occupation.title} - ${skill.name}`,
            content: `Skill required for ${occupation.title}: ${skill.name}. Importance: ${skill.importance}, Level: ${skill.level}`,
          });
        }
      }

      // Knowledge chunks
      if (occupation.knowledge) {
        for (const k of occupation.knowledge) {
          chunks.push({
            sourceType: 'occupation_knowledge',
            sourceId: occupation._id,
            title: `${occupation.title} - ${k.name}`,
            content: `Knowledge required for ${occupation.title}: ${k.name}. Importance: ${k.importance}, Level: ${k.level}`,
          });
        }
      }

      // Work activities chunks
      if (occupation.workActivities) {
        for (const activity of occupation.workActivities) {
          chunks.push({
            sourceType: 'occupation_activity',
            sourceId: occupation._id,
            title: `${occupation.title} - ${activity.name}`,
            content: `Work activity for ${occupation.title}: ${activity.name}. Importance: ${activity.importance}, Level: ${activity.level}`,
          });
        }
      }

      let generated = 0;
      for (const chunkData of chunks) {
        try {
          const embedding = await generateEmbedding(chunkData.content);
          
          await CareerKnowledgeChunk.updateOne(
            { sourceId: chunkData.sourceId, title: chunkData.title },
            { ...chunkData, embedding },
            { upsert: true }
          );
          generated++;
        } catch (err: any) {
          console.error(`[EmbeddingWorker] Error generating chunk for ${chunkData.title}:`, err.message);
        }
      }

      console.log(`[EmbeddingWorker] Finished ${occupation.occupationCode}. Generated ${generated} chunks.`);
    },
    { connection: redis as any, concurrency: 2 }
  );

  worker.on('failed', (job, err) => {
    console.error(`[EmbeddingWorker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error(`[EmbeddingWorker] Worker error:`, err);
  });

  return worker;
};
