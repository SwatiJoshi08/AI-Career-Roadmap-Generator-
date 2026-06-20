import { pipeline, env } from '@xenova/transformers';

// Configure transformers to not use local file system if not needed, 
// though for Node it works fine by downloading models to a cache dir.
env.allowLocalModels = false;

// We use all-MiniLM-L6-v2 which produces 384-dimensional embeddings
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

let extractorPipeline: any = null;

/**
 * Initializes and caches the embedding pipeline.
 */
async function getPipeline() {
  if (!extractorPipeline) {
    // Dynamically import pipeline to avoid initial load overhead if not used
    extractorPipeline = await pipeline('feature-extraction', MODEL_NAME);
  }
  return extractorPipeline;
}

/**
 * Generates an embedding for a given text.
 * @param text The input text to embed.
 * @returns A 384-dimension number array.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const extractor = await getPipeline();
    // Perform feature extraction with mean pooling and normalization
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    // output.data is a Float32Array containing the embedding
    return Array.from(output.data);
  } catch (error: any) {
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};
