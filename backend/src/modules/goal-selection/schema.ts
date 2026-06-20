import { z } from 'zod';
import { GoalPriority } from '../../database/models/enums';

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetDate: z.coerce.date().optional(),
  priority: z.nativeEnum(GoalPriority).optional(),
  goalType: z.string().optional(),
  occupationCode: z.string().optional(),
  occupationTitle: z.string().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  targetDate: z.coerce.date().optional(),
  priority: z.nativeEnum(GoalPriority).optional(),
  goalType: z.string().optional(),
  status: z.string().optional(),
  occupationCode: z.string().optional(),
  occupationTitle: z.string().optional(),
});
