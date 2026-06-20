import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string({
    required_error: 'MONGODB_URI is required',
  }),
  REDIS_URL: z.string({
    required_error: 'REDIS_URL is required',
  }),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required',
  }),
  JWT_EXPIRES_IN: z.string().default('1d'),
  SESSION_SECRET: z.string({
    required_error: 'SESSION_SECRET is required',
  }),
  CLOUDINARY_CLOUD_NAME: z.string({
    required_error: 'CLOUDINARY_CLOUD_NAME is required',
  }),
  CLOUDINARY_API_KEY: z.string({
    required_error: 'CLOUDINARY_API_KEY is required',
  }),
  CLOUDINARY_API_SECRET: z.string({
    required_error: 'CLOUDINARY_API_SECRET is required',
  }),
  GROQ_API_KEY: z.string({
    required_error: 'GROQ_API_KEY is required',
  }),
  AI_MODEL: z.string().default('GROQ'),
  APP_ORIGIN: z.string({
    required_error: 'APP_ORIGIN is required',
  }),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

let parsedEnv: z.infer<typeof envSchema>;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingKeys = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n  ');
    console.error('❌ Invalid or missing environment variables:\n  ' + missingKeys);
    throw new Error('Startup failed due to invalid environment configuration.');
  }
  throw error;
}

export type Config = z.infer<typeof envSchema>;

export const config: Config = parsedEnv;
