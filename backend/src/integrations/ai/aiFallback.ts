export const generateFallbackPathway = (gapCount: number) => {
  return {
    phases: [
      {
        title: 'Foundation',
        durationWeeks: gapCount * 2,
        skills: ['Core Concepts', 'Basic Tools'],
        resources: [
          { title: 'General Overview', url: 'https://example.com/foundation', type: 'article' },
        ],
        milestones: [
          { title: 'Complete Foundation', description: 'Understand basic principles' },
        ],
      },
      {
        title: 'Applied Skills',
        durationWeeks: gapCount * 1,
        skills: ['Practical Application', 'Problem Solving'],
        resources: [
          { title: 'Hands-on Practice', url: 'https://example.com/practice', type: 'course' },
        ],
        milestones: [
          { title: 'First Mini-Project', description: 'Apply skills to a small task' },
        ],
      },
      {
        title: 'Portfolio',
        durationWeeks: 4,
        skills: ['Project Management', 'Presentation'],
        resources: [
          { title: 'Portfolio Building', url: 'https://example.com/portfolio', type: 'guide' },
        ],
        milestones: [
          { title: 'Final Project', description: 'Complete a portfolio-ready project' },
        ],
      },
    ],
    totalWeeks: gapCount * 2 + gapCount * 1 + 4,
    confidenceNote: 'Template roadmap — AI service was unavailable',
    limitations: 'This is a generic template. Please review with your mentor for personalization.',
  };
};
