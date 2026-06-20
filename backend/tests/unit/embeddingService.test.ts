jest.mock('@xenova/transformers', () => {
  return {
    pipeline: jest.fn().mockResolvedValue(
      jest.fn().mockResolvedValue({
        data: new Float32Array(384).fill(0.1) // Mock 384-dim array
      })
    ),
    env: { allowLocalModels: false }
  };
});

import { generateEmbedding } from '../../src/integrations/embeddings/embeddingService';

describe('Embedding Service', () => {
  it('should generate a 384-dimensional embedding for a given text', async () => {
    const text = 'Software developers design, create, and modify computer applications software or specialized utility programs.';
    const embedding = await generateEmbedding(text);
    
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(384);
    expect(embedding.every(val => typeof val === 'number' && !isNaN(val) && val >= -1 && val <= 1)).toBe(true);
  });
});
