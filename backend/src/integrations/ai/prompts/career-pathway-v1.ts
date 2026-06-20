export interface CareerPathwayInput {
  currentRole: string;
  targetRole: string;
  currentSkills: string[];
  identifiedGaps: string[];
  availableHoursPerWeek: number;
  targetDate: string;
  retrievedContext?: string;
}

export const buildPrompt = (input: CareerPathwayInput): string => {
  return `${input.retrievedContext || ''}
Act as a career planning assistant.
Use ONLY the provided data — no external assumptions.
When listing resources, ONLY use URLs and titles that appear in the RETRIEVED CAREER KNOWLEDGE below.
If no resource is available for a skill, use an empty array for the resources field.
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
