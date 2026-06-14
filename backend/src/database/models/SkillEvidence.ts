import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';

export interface ISkillEvidence extends IBaseDocument {
  skillId: Types.ObjectId;
  userId: Types.ObjectId;
  evidenceType?: string;
  evidenceUrl?: string;
  description?: string;
  verifiedAt?: Date;
}

const skillEvidenceSchema = new Schema<ISkillEvidence>(
  {
    ...baseSchemaDefinition,
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evidenceType: { type: String },
    evidenceUrl: { type: String },
    description: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

applyBaseSchemaSetup(skillEvidenceSchema);

export const SkillEvidence = mongoose.model<ISkillEvidence>('SkillEvidence', skillEvidenceSchema);
