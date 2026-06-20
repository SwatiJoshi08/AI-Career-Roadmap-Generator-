import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';

export interface IRoadmapMilestone extends IBaseDocument {
  roadmapId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date;
  resources: string[];
  orderIndex?: number;
}

const roadmapMilestoneSchema = new Schema<IRoadmapMilestone>(
  {
    ...baseSchemaDefinition,
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    completedAt: { type: Date },
    resources: [{
      url: { type: String, required: true },
      linkStatus: { type: String, enum: ['unverified', 'verified', 'broken'], default: 'unverified' },
      lastCheckedAt: { type: Date, default: null },
      fallbackUrl: { type: String, default: null }
    }],
    orderIndex: { type: Number },
  },
  { timestamps: true }
);

applyBaseSchemaSetup(roadmapMilestoneSchema);

export const RoadmapMilestone = mongoose.model<IRoadmapMilestone>('RoadmapMilestone', roadmapMilestoneSchema);
