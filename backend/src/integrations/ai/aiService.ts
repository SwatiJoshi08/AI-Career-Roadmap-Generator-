import { GoogleGenerativeAI } from '@google/generative-ai';
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

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: config.AI_MODEL });

export const generateCareerPathway = async (input: CareerPathwayInput) => {
  // 1. Validate input
  const validatedInput = inputSchema.parse(input);

  // 2. Build prompt
  const promptVersion = 'career-pathway-v1';
  const prompt = buildPrompt(validatedInput);

  const requestTimestamp = new Date();
  let text = '';

  try {
    // 3. Call Gemini API with 15s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Promise.race to enforce timeout if the SDK doesn't support AbortSignal natively
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error('Timeout')));
      }),
    ]);

    clearTimeout(timeoutId);
    text = result.response.text();
  } catch (error) {
    throw new AiServiceError(`Gemini AI execution failed: ${(error as Error).message}`, error);
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
      modelName: config.AI_MODEL,
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
