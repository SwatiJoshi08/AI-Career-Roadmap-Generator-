import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';

export interface IMentorComment extends IBaseDocument {
  mentorId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetModel?: string;
  comment: string;
  actionRequired: boolean;
}

const mentorCommentSchema = new Schema<IMentorComment>(
  {
    ...baseSchemaDefinition,
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetModel: { type: String },
    comment: { type: String, required: true },
    actionRequired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applyBaseSchemaSetup(mentorCommentSchema);

export const MentorComment = mongoose.model<IMentorComment>('MentorComment', mentorCommentSchema);
