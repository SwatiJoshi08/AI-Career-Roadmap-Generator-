export const generateFallbackPathway = (gapCount: number) => {
  const g = gapCount === 0 ? 3 : gapCount;
  const foundationWeeks = Math.max(g * 2, 4);
  const appliedWeeks = Math.max(g * 1, 2);
  const portfolioWeeks = 4;
  const totalWeeks = foundationWeeks + appliedWeeks + portfolioWeeks;

  return {
    phases: [
      {
        title: 'Foundation',
        durationWeeks: foundationWeeks,
        skills: ['Core Concepts', 'Basic Tools'],
        resources: [
          { title: "MDN Web Docs", url: "https://developer.mozilla.org", type: "documentation" },
          { title: "freeCodeCamp", url: "https://www.freecodecamp.org", type: "course" },
          { title: "The Odin Project", url: "https://www.theodinproject.com", type: "course" }
        ],
        milestones: [
          { title: 'Complete Foundation', description: 'Understand basic principles' },
        ],
      },
      {
        title: 'Applied Skills',
        durationWeeks: appliedWeeks,
        skills: ['Practical Application', 'Problem Solving'],
        resources: [
          { title: "JavaScript.info", url: "https://javascript.info", type: "documentation" },
          { title: "React Official Docs", url: "https://react.dev", type: "documentation" },
          { title: "Node.js Docs", url: "https://nodejs.org/docs", type: "documentation" }
        ],
        milestones: [
          { title: 'First Mini-Project', description: 'Apply skills to a small task' },
        ],
      },
      {
        title: 'Portfolio',
        durationWeeks: portfolioWeeks,
        skills: ['Project Management', 'Presentation'],
        resources: [
          { title: "GitHub", url: "https://github.com", type: "tool" },
          { title: "Vercel Deploy", url: "https://vercel.com", type: "tool" },
          { title: "LinkedIn", url: "https://linkedin.com", type: "networking" }
        ],
        milestones: [
          { title: 'Final Project', description: 'Complete a portfolio-ready project' },
        ],
      },
    ],
    totalWeeks,
    confidenceNote: 'Template roadmap — AI service was unavailable',
    limitations: 'This is a generic template. Please review with your mentor for personalization.',
  };
};
