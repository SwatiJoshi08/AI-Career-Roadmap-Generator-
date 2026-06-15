import { generateFallbackPathway } from '../../src/integrations/ai/aiFallback';

describe('generateFallbackPathway', () => {
  it('returns 3 phases', () => {
    const result = generateFallbackPathway(5);
    expect(result.phases).toHaveLength(3);
  });

  it('totalWeeks is greater than 0', () => {
    const result = generateFallbackPathway(3);
    expect(result.totalWeeks).toBeGreaterThan(0);
  });

  it('has fallback confidence note', () => {
    const result = generateFallbackPathway(2);
    expect(result.confidenceNote).toContain('unavailable');
  });

  it('handles 0 gaps', () => {
    const result = generateFallbackPathway(0);
    expect(result.phases).toHaveLength(3);
    expect(result.totalWeeks).toBeGreaterThan(0);
  });
});
