import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';
import { ProficiencyLevel } from './enums';

export interface ISkill extends IBaseDocument {
  userId: Types.ObjectId;
  name: string;
  category?: string;
  proficiencyLevel?: ProficiencyLevel;
  isVerified: boolean;
}

const skillSchema = new Schema<ISkill>(
  {
    ...baseSchemaDefinition,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String },
    proficiencyLevel: { type: String, enum: Object.values(ProficiencyLevel) },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

skillSchema.index({ name: 'text' });
skillSchema.index({ userId: 1, category: 1 });
applyBaseSchemaSetup(skillSchema);

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);
