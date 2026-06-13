export const getFallbackRoadmap = (role: string, targetRole: string): string => {
  return JSON.stringify(
    {
      title: `Career Transition: ${role} to ${targetRole} (Fallback)`,
      steps: [
        {
          id: 1,
          title: 'Learn the fundamentals',
          description: 'Begin learning base skills needed for the new role',
        },
        {
          id: 2,
          title: 'Build portfolio projects',
          description: 'Create simple applications displaying required skills',
        },
        {
          id: 3,
          title: 'Apply and Interview',
          description: 'Practice interviews and submit applications',
        },
      ],
    },
    null,
    2
  );
};
