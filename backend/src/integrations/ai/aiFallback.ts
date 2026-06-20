export const generateFallbackPathway = (gapsOrCount: number | Array<{ skillName: string }>) => {
  let gaps: Array<{ skillName: string }> = [];
  let gapCount = 0;
  
  if (typeof gapsOrCount === 'number') {
    gapCount = gapsOrCount;
  } else if (Array.isArray(gapsOrCount)) {
    gaps = gapsOrCount;
    gapCount = gaps.length;
  }

  const g = gapCount === 0 ? 3 : gapCount;
  const foundationWeeks = Math.max(g * 2, 4);
  const appliedWeeks = Math.max(g * 1, 2);
  const portfolioWeeks = 4;
  const totalWeeks = foundationWeeks + appliedWeeks + portfolioWeeks;

  const gapNames = gaps.map(x => x.skillName);

  // Distribute gapNames among phases
  let p1Skills = ['Core Concepts', 'Basic Tools'];
  let p2Skills = ['Practical Application', 'Problem Solving'];
  let p3Skills = ['Project Management', 'Presentation'];

  if (gapNames.length > 0) {
    const size = Math.ceil(gapNames.length / 3);
    p1Skills = gapNames.slice(0, size);
    p2Skills = gapNames.slice(size, size * 2);
    p3Skills = gapNames.slice(size * 2);
    
    // Ensure no phase is empty
    if (p1Skills.length === 0) p1Skills = ['Foundation'];
    if (p2Skills.length === 0) p2Skills = ['Applied Skills'];
    if (p3Skills.length === 0) p3Skills = ['Portfolio'];
  }

  return {
    phases: [
      {
        title: 'Foundation',
        durationWeeks: foundationWeeks,
        skills: p1Skills,
        resources: [
          { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/", type: "documentation" },
          { title: "freeCodeCamp", url: "https://www.freecodecamp.org/learn", type: "course" },
          { title: "The Odin Project", url: "https://www.theodinproject.com/paths", type: "course" }
        ],
        milestones: [
          { title: 'Complete Foundation', description: `Master key concepts: ${p1Skills.join(', ')}` },
        ],
      },
      {
        title: 'Applied Skills',
        durationWeeks: appliedWeeks,
        skills: p2Skills,
        resources: [
          { title: "JavaScript.info", url: "https://javascript.info/", type: "documentation" },
          { title: "React Official Docs", url: "https://react.dev/", type: "documentation" },
          { title: "Node.js Docs", url: "https://nodejs.org/en/docs/", type: "documentation" }
        ],
        milestones: [
          { title: 'First Mini-Project', description: `Implement practical projects using: ${p2Skills.join(', ')}` },
        ],
      },
      {
        title: 'Portfolio',
        durationWeeks: portfolioWeeks,
        skills: p3Skills,
        resources: [
          { title: "GitHub", url: "https://github.com/search?q=", type: "tool" },
          { title: "Vercel Deploy", url: "https://www.google.com/search?q=+vercel.com", type: "tool" },
          { title: "LinkedIn", url: "https://www.google.com/search?q=+linkedin.com", type: "networking" }
        ],
        milestones: [
          { title: 'Final Project', description: `Complete a portfolio-ready project showcasing: ${p3Skills.join(', ')}` },
        ],
      },
    ],
    totalWeeks,
    confidenceNote: 'Template roadmap — AI service was unavailable',
    limitations: 'This is a generic template. Please review with your mentor for personalization.',
  };
};
