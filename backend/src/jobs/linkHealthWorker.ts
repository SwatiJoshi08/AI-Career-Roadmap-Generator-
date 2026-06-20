import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import pLimit from 'p-limit';
import { RoadmapMilestone } from '../database/models/RoadmapMilestone';
import { CareerKnowledgeChunk } from '../database/models/CareerKnowledgeChunk';
import { checkLinkHealth, generateFallbackSearchUrl } from '../integrations/linkHealth/linkHealthService';

const CONCURRENCY = 5;

/**
 * Pull distinct resource objects from Milestones and KnowledgeChunks,
 * run health checks, and update DB records.
 */
export async function checkAndUpdateResources() {
  // 1️⃣ Gather distinct resource objects
  const milestoneResources = await RoadmapMilestone.find(
    { 'resources.url': { $exists: true } },
    { 'resources.$': 1 }
  ).lean();

  // Flatten to array of { _id, resourceIndex, url, title? }
  const milestoneEntries: {
    docId: string;
    index: number;
    url: string;
    title?: string;
  }[] = [];

  milestoneResources.forEach((doc: any) => {
    if (Array.isArray(doc.resources)) {
      doc.resources.forEach((r: any, idx: number) => {
        if (r.url && (r.linkStatus === 'unverified' || !r.lastCheckedAt || (Date.now() - new Date(r.lastCheckedAt).getTime() > 7 * 24 * 60 * 60 * 1000))) {
          milestoneEntries.push({
            docId: doc._id.toString(),
            index: idx,
            url: r.url,
            title: r.title, // optional – fallback can use title if present
          });
        }
      });
    }
  });

  // KnowledgeChunk resources (if they store URLs)
  const chunkResources = await CareerKnowledgeChunk.find(
    { 'metadata.resourceUrl': { $exists: true } },
    { metadata: 1 }
  ).lean();

  const chunkEntries: {
    docId: string;
    index?: number;
    url: string;
    title?: string;
  }[] = [];

  chunkResources.forEach((doc: any) => {
    const url = doc.metadata?.resourceUrl;
    const title = doc.metadata?.resourceTitle;
    const linkStatus = doc.metadata?.linkStatus;
    const lastCheckedAt = doc.metadata?.lastCheckedAt;
    
    if (url && (!linkStatus || linkStatus === 'unverified' || !lastCheckedAt || (Date.now() - new Date(lastCheckedAt).getTime() > 7 * 24 * 60 * 60 * 1000))) {
      chunkEntries.push({ docId: doc._id.toString(), url, title });
    }
  });

  const allEntries = [...milestoneEntries, ...chunkEntries];
  const total = allEntries.length;

  const limit = pLimit(CONCURRENCY);
  let checked = 0;
  let broken = 0;
  const now = new Date();

  await Promise.all(
    allEntries.map((entry) =>
      limit(async () => {
        const { isAlive } = await checkLinkHealth(entry.url);
        if (isAlive) {
          // Update Milestone entry
          if (entry.docId && typeof entry.index === 'number') {
            await RoadmapMilestone.updateOne(
              { _id: entry.docId, 'resources.url': entry.url },
              {
                $set: {
                  'resources.$.linkStatus': 'verified',
                  'resources.$.lastCheckedAt': now,
                },
                $unset: { 'resources.$.fallbackUrl': '' },
              }
            );
          } else if (entry.docId) {
            await CareerKnowledgeChunk.updateOne(
              { _id: entry.docId },
              {
                $set: {
                  'metadata.linkStatus': 'verified',
                  'metadata.lastCheckedAt': now,
                },
                $unset: { 'metadata.fallbackUrl': '' },
              }
            );
          }
        } else {
          broken++;
          const fallback = generateFallbackSearchUrl(entry.title ?? entry.url);
          if (entry.docId && typeof entry.index === 'number') {
            await RoadmapMilestone.updateOne(
              { _id: entry.docId, 'resources.url': entry.url },
              {
                $set: {
                  'resources.$.linkStatus': 'broken',
                  'resources.$.lastCheckedAt': now,
                  'resources.$.fallbackUrl': fallback,
                },
              }
            );
          } else if (entry.docId) {
            await CareerKnowledgeChunk.updateOne(
              { _id: entry.docId },
              {
                $set: {
                  'metadata.linkStatus': 'broken',
                  'metadata.lastCheckedAt': now,
                  'metadata.fallbackUrl': fallback,
                },
              }
            );
          }
        }
        checked++;
      })
    )
  );

  console.info(
    `[LinkHealth] Checked ${checked}/${total} URLs – broken: ${broken}`
  );
}

// BullMQ Worker
export const linkHealthWorker = new Worker(
  'link-health-check-queue',
  async (job) => {
    console.log(`[LinkHealthWorker] Starting link health check job ${job.id}`);
    await checkAndUpdateResources();
    console.log(`[LinkHealthWorker] Finished link health check job ${job.id}`);
  },
  {
    connection: redis as any,
  }
);
