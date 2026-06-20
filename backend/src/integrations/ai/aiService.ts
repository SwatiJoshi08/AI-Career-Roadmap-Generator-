import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../../config/env';
import { AiServiceError, AiOutputValidationError } from '../../common/errors';
import { buildPrompt, CareerPathwayInput } from './prompts/career-pathway-v1';

const inputSchema = z.object({
  currentRole: z.string(),
  targetRole: z.string(),
  currentSkills: z.array(z.string()),
  identifiedGaps: z.array(z.string()),
  availableHoursPerWeek: z.number(),
  targetDate: z.string(),
});

const outputSchema = z.object({
  phases: z.array(
    z.object({
      title: z.string(),
      durationWeeks: z.number(),
      skills: z.array(z.string()),
      resources: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          type: z.string(),
        })
      ),
      milestones: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
  totalWeeks: z.number(),
  confidenceNote: z.string().max(200),
  limitations: z.string().max(300),
});

const openai = new OpenAI({
  baseURL: 'https://www.google.com/search?q=v1+api.groq.com',
  apiKey: config.GROQ_API_KEY,
});

export const generateCareerPathway = async (input: CareerPathwayInput) => {
  // 1. Validate input
  const validatedInput = inputSchema.parse(input);

  // 2. Build prompt
  const promptVersion = 'career-pathway-v1';
  const prompt = buildPrompt(validatedInput);

  const requestTimestamp = new Date();
  let text = '';

  try {
    // 3. Call GROQ API with 15s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await openai.chat.completions.create(
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      },
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    text = response.choices[0]?.message?.content || '';
  } catch (error) {
    throw new AiServiceError(`GROQ AI execution failed: ${(error as Error).message}`, error);
  }

  const responseTimestamp = new Date();

  // 4. Parse response
  let parsedJson;
  try {
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedJson = JSON.parse(cleanedText);
  } catch (error) {
    throw new AiOutputValidationError('Failed to parse AI output as JSON', error);
  }

  // 5. Validate output schema
  try {
    const validatedOutput = outputSchema.parse(parsedJson);
    // 6. Return structured output + metadata
    return {
      result: validatedOutput,
      modelName: 'llama-3.3-70b-versatile',
      promptVersion,
      requestTimestamp,
      responseTimestamp,
    };
  } catch (error) {
    if (config.LOG_LEVEL === 'debug') {
      console.debug('AI Output validation error details:', error);
    } else {
      console.error('AI output validation failed');
    }
    throw new AiOutputValidationError('AI output validation failed', error);
  }
};
