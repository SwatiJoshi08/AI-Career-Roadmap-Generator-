import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoadmapExplanation extends Document {
  roadmapId: Types.ObjectId;
  phaseId?: string;
  skill: string;
  reason: string;
  sourceType?: string;
  sourceId?: string;
  confidenceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapExplanationSchema = new Schema<IRoadmapExplanation>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    phaseId: { type: String },
    skill: { type: String, required: true },
    reason: { type: String, required: true },
    sourceType: { type: String },
    sourceId: { type: String },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

roadmapExplanationSchema.index({ roadmapId: 1 });

export const RoadmapExplanation = mongoose.model<IRoadmapExplanation>(
  'RoadmapExplanation',
  roadmapExplanationSchema
);
