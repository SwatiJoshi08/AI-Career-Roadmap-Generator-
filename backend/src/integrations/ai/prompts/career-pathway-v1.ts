export interface CareerPathwayInput {
  currentRole: string;
  targetRole: string;
  currentSkills: string[];
  identifiedGaps: string[];
  availableHoursPerWeek: number;
  targetDate: string;
}

export const buildPrompt = (input: CareerPathwayInput): string => {
  return `Act as a career planning assistant.
Use ONLY the provided data — no external assumptions.
Return ONLY valid JSON, no markdown, no explanation, no preamble, no backticks, no \`\`\`json blocks.
Match this exact output schema:
{
  "phases": [
    {
      "title": "string",
      "durationWeeks": number,
      "skills": ["string"],
      "resources": [{ "title": "string", "url": "string", "type": "string" }],
      "milestones": [{ "title": "string", "description": "string" }]
    }
  ],
  "totalWeeks": number,
  "confidenceNote": "string (max 200 chars)",
  "limitations": "string (max 300 chars)"
}

Input data:
Current Role: ${input.currentRole}
Target Role: ${input.targetRole}
Current Skills: ${input.currentSkills.join(', ')}
Identified Gaps: ${input.identifiedGaps.join(', ')}
Available Hours Per Week: ${input.availableHoursPerWeek}
Target Date: ${input.targetDate}
`;
};
