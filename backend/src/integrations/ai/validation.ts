// src/integrations/ai/validation.ts

/**
 * Validate that resource URLs in the generated roadmap are legitimate.
 * Only URLs whose domain is in the allow‑list AND that appear in the RAG
 * context resources are kept. Invalid entries are removed and a warning is
 * logged.
 */
export const validateRoadmapResources = (
  roadmap: any,
  allowedDomains: string[],
  contextResources: { title: string; content: string }[]
): any => {
  const urlPattern = /https?:\/\/[^\s]+/i;
  const contextUrlSet = new Set(contextResources.map((r) => r.content.trim()));

  roadmap.phases = roadmap.phases.map((phase: any) => {
    if (!Array.isArray(phase.resources)) return phase;
    const filtered = phase.resources.filter((res: any) => {
      if (typeof res.url !== 'string') return false;
      const match = res.url.match(urlPattern);
      if (!match) return false;
      try {
        const domain = new URL(match[0]).hostname.replace(/^www\./, '');
        if (!allowedDomains.includes(domain)) return false;
        if (!contextUrlSet.has(res.url)) return false;
        return true;
      } catch {
        return false;
      }
    });
    if (filtered.length === 0) {
      console.warn(`Validation: Phase "${phase.title}" has no legitimate resources.`);
    }
    return { ...phase, resources: filtered };
  });
  return roadmap;
};
