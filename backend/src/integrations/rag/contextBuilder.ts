import { retrieveKnowledge, RetrievalResult } from './retrievalService';

export interface RagContext {
  targetRole: string;
  occupations: RetrievalResult[];
  skills: RetrievalResult[];
  knowledge: RetrievalResult[];
  activities: RetrievalResult[];
  resources: RetrievalResult[];
}

/**
 * Build a RAG context for gap analysis.
 * The `currentRole` parameter was unused, so it has been removed.
 */
export const buildContextForGapAnalysis = async (
  targetRole: string,
  identifiedGaps: string[]
): Promise<RagContext> => {
  const gapsArray = identifiedGaps ?? [];
  const query = `${targetRole}. Required skills: ${gapsArray.join(', ')}`;

  // Parallel retrieval for different knowledge types
  const [occupations, skills, knowledge, activities, resources] = await Promise.all([
    retrieveKnowledge(targetRole, 10, 'occupation_description'),
    retrieveKnowledge(query, 10, 'occupation_skill'),
    retrieveKnowledge(query, 10, 'occupation_knowledge'),
    retrieveKnowledge(targetRole, 10, 'occupation_activity'),
    retrieveKnowledge(query, 10, 'resource'),
  ]);

  return {
    targetRole,
    occupations,
    skills,
    knowledge,
    activities,
    resources,
  };
};

/**
 * Format the RAG context into a prompt string.
 * Unused index variables in forEach callbacks have been replaced with underscores.
 */
export const formatContextForPrompt = (context: RagContext): string => {
  let promptContext = `--- RETRIEVED CAREER KNOWLEDGE ---\n\n`;

  promptContext += `## Related Occupations\n`;
  context.occupations.forEach((occ, _idx) => {
    promptContext += `${_idx + 1}. ${occ.title}: ${occ.content}\n`;
  });

  promptContext += `\n## Relevant Skills\n`;
  context.skills.forEach((_s, _idx) => {
    promptContext += `- ${_s.content}\n`;
  });

  promptContext += `\n## Relevant Knowledge Areas\n`;
  context.knowledge.forEach((_k, _idx) => {
    promptContext += `- ${_k.content}\n`;
  });

  promptContext += `\n## Work Activities\n`;
  context.activities.forEach((_a, _idx) => {
    promptContext += `- ${_a.content}\n`;
  });

  promptContext += `\n## Resources\n`;
  context.resources.forEach((_r, _idx) => {
    promptContext += `- ${_r.title}: ${_r.content}\n`;
  });

  promptContext += `\n----------------------------------\n\n`;
  promptContext += `IMPORTANT INSTRUCTION: You MUST base your roadmap generation on the retrieved career knowledge provided above. Do not hallucinate certifications or skills that are not relevant to these sources.\n\n`;

  return promptContext;
};
