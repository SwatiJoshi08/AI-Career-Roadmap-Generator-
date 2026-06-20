import { CareerKnowledgeChunk } from '../../database/models/CareerKnowledgeChunk';
import { generateEmbedding } from '../embeddings/embeddingService';

export interface RetrievalResult {
  score: number;
  sourceType: string;
  sourceId: string;
  title: string;
  content: string;
}

/**
 * Searches for knowledge chunks similar to the query using MongoDB vector search.
 */
export const retrieveKnowledge = async (
  query: string,
  limit: number = 10,
  sourceTypeFilter?: string
): Promise<RetrievalResult[]> => {
  const embedding = await generateEmbedding(query);

  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: 'career_knowledge_vector',
        path: 'embedding',
        queryVector: embedding,
        numCandidates: limit * 10,
        limit,
      }
    },
    {
      $project: {
        _id: 0,
        score: { $meta: 'vectorSearchScore' },
        sourceType: 1,
        sourceId: 1,
        title: 1,
        content: 1,
      }
    }
  ];

  if (sourceTypeFilter) {
    // Atlas Vector Search supports a 'filter' field inside $vectorSearch starting MongoDB 6.0.11+
    pipeline[0].$vectorSearch.filter = { sourceType: sourceTypeFilter };
  }

  const results = await CareerKnowledgeChunk.aggregate(pipeline);
  return results as RetrievalResult[];
};
