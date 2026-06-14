import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';
import { EducationLevel } from './enums';

export interface ICareerProfile extends IBaseDocument {
  userId: Types.ObjectId;
  currentRole?: string;
  targetRole?: string;
  yearsOfExperience?: number;
  educationLevel?: EducationLevel;
  bio?: string;
}

const careerProfileSchema = new Schema<ICareerProfile>(
  {
    ...baseSchemaDefinition,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentRole: { type: String },
    targetRole: { type: String },
    yearsOfExperience: { type: Number },
    educationLevel: { type: String, enum: Object.values(EducationLevel) },
    bio: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

applyBaseSchemaSetup(careerProfileSchema);

export const CareerProfile = mongoose.model<ICareerProfile>('CareerProfile', careerProfileSchema);
