import { z } from 'zod';
import { ProficiencyLevel } from '../../database/models/enums';

// Schema for query parameters when listing skills
export const getSkillsSchema = z.object({
  category: z.string().optional(),
  proficiencyLevel: z.nativeEnum(ProficiencyLevel).optional(),
});

// Schema for creating a skill
export const createSkillSchema = z.object({
  name: z.string().min(1, { message: 'Skill name is required' }),
  category: z.string().optional(),
  proficiencyLevel: z.nativeEnum(ProficiencyLevel).optional(),
  isVerified: z.boolean().optional(),
});

// Schema for updating a skill (all fields optional)
export const updateSkillSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  proficiencyLevel: z.nativeEnum(ProficiencyLevel).optional(),
  isVerified: z.boolean().optional(),
});

// Schema for adding evidence to a skill
export const addEvidenceSchema = z.object({
  evidenceType: z.string().optional(),
  evidenceUrl: z.string().url().optional(),
  description: z.string().max(500).optional(),
  verifiedAt: z.string().datetime().optional(),
});
