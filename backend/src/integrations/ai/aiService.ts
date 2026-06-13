import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/env';
import { AiServiceError } from '../../common/errors';

// Initialize the Anthropic SDK client
const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
});

export const generateCareerAdvice = async (prompt: string): Promise<string> => {
  try {
    const response = await anthropic.messages.create({
      model: config.AI_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || !('text' in textContent)) {
      throw new AiServiceError('AI service returned empty text response');
    }
    return textContent.text;
  } catch (error) {
    throw new AiServiceError(
      `Anthropic AI execution failed: ${(error as Error).message}`,
      error
    );
  }
};
