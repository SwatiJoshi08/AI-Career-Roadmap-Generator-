import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';

export interface IProgressUpdate extends IBaseDocument {
  userId: Types.ObjectId;
  roadmapId?: Types.ObjectId;
  milestoneId?: Types.ObjectId;
  note?: string;
  evidenceUrl?: string;
  fileName?: string;
  publicId?: string;
  resourceType?: string;
  fileSize?: number;
  reviewedBy?: Types.ObjectId;
  flaggedForReview: boolean;
}

const progressUpdateSchema = new Schema<IProgressUpdate>(
  {
    ...baseSchemaDefinition,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'RoadmapMilestone' },
    note: { type: String },
    evidenceUrl: { type: String },
    fileName: { type: String },
    publicId: { type: String },
    resourceType: { type: String },
    fileSize: { type: Number },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    flaggedForReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applyBaseSchemaSetup(progressUpdateSchema);

export const ProgressUpdate = mongoose.model<IProgressUpdate>('ProgressUpdate', progressUpdateSchema);
