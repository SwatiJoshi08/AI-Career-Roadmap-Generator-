import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';
import { JobStatus, GoalPriority } from './enums';

export interface IGapAnalysis extends IBaseDocument {
  userId: Types.ObjectId;
  careerGoalId?: Types.ObjectId;
  identifiedGaps: Array<{ skillName: string; priority: GoalPriority; estimatedWeeks: number }>;
  aiGenerated: boolean;
  modelVersion?: string;
  jobStatus: JobStatus;
  aiResult?: any;
  fallbackUsed: boolean;
  modelName?: string;
  promptVersion?: string;
  requestTimestamp?: Date;
  responseTimestamp?: Date;
  retrievedDocuments?: string[];
  retrievalScores?: number[];
}

const gapAnalysisSchema = new Schema<IGapAnalysis>(
  {
    ...baseSchemaDefinition,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    careerGoalId: { type: Schema.Types.ObjectId, ref: 'CareerGoal' },
    identifiedGaps: [
      {
        skillName: { type: String, required: true },
        priority: { type: String, enum: Object.values(GoalPriority), required: true },
        estimatedWeeks: { type: Number, required: true },
      },
    ],
    aiGenerated: { type: Boolean, default: false },
    modelVersion: { type: String },
    jobStatus: { type: String, enum: Object.values(JobStatus), required: true },
    aiResult: { type: Schema.Types.Mixed },
    fallbackUsed: { type: Boolean, default: false },
    modelName: { type: String },
    promptVersion: { type: String },
    requestTimestamp: { type: Date },
    responseTimestamp: { type: Date },
    retrievedDocuments: [{ type: String }],
    retrievalScores: [{ type: Number }],
  },
  { timestamps: true }
);

gapAnalysisSchema.index({ userId: 1, jobStatus: 1 });
applyBaseSchemaSetup(gapAnalysisSchema);

export const GapAnalysis = mongoose.model<IGapAnalysis>('GapAnalysis', gapAnalysisSchema);
