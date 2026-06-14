import { z } from 'zod';
import { EducationLevel } from '../../database/models/enums';

export const createProfileSchema = z.object({
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  educationLevel: z.nativeEnum(EducationLevel).optional(),
  bio: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  educationLevel: z.nativeEnum(EducationLevel).optional(),
  bio: z.string().max(500).optional(),
});
