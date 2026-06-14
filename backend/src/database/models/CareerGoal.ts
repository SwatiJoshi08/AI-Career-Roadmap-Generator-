import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';
import { GoalPriority } from './enums';

export interface ICareerGoal extends IBaseDocument {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  targetDate?: Date;
  priority?: GoalPriority;
  goalType?: string;
}

const careerGoalSchema = new Schema<ICareerGoal>(
  {
    ...baseSchemaDefinition,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date },
    priority: { type: String, enum: Object.values(GoalPriority) },
    goalType: { type: String },
  },
  { timestamps: true }
);

careerGoalSchema.index({ userId: 1, status: 1 });
careerGoalSchema.index({ userId: 1, createdAt: 1 });
applyBaseSchemaSetup(careerGoalSchema);

export const CareerGoal = mongoose.model<ICareerGoal>('CareerGoal', careerGoalSchema);
