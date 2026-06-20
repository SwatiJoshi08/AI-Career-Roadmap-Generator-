import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';

export interface IRoadmap extends IBaseDocument {
  userId: Types.ObjectId;
  careerGoalId?: Types.ObjectId;
  gapAnalysisId?: Types.ObjectId;
  title: string;
  estimatedDuration?: number; // weeks
  completionPercentage: number;
  activatedAt?: Date;
  sourceReferences?: Array<{
    sourceType: string;
    sourceId: string;
    title: string;
  }>;
}

const roadmapSchema = new Schema<IRoadmap>(
  {
    ...baseSchemaDefinition,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    careerGoalId: { type: Schema.Types.ObjectId, ref: 'CareerGoal' },
    gapAnalysisId: { type: Schema.Types.ObjectId, ref: 'GapAnalysis' },
    title: { type: String, required: true },
    estimatedDuration: { type: Number },
    completionPercentage: { type: Number, default: 0 },
    activatedAt: { type: Date },
    sourceReferences: [
      {
        sourceType: { type: String },
        sourceId: { type: String },
        title: { type: String },
      }
    ],
  },
  { timestamps: true }
);

roadmapSchema.index({ userId: 1, status: 1 });
applyBaseSchemaSetup(roadmapSchema);

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
