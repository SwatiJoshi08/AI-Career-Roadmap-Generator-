import mongoose, { Schema, Document } from 'mongoose';

export interface IOnetOccupation extends Document {
  occupationCode: string;
  title: string;
  description: string;
  sampleJobTitles?: string[];
  skills?: { name: string; description?: string; importance: number; level: number }[];
  knowledge?: { name: string; description?: string; importance: number; level: number }[];
  abilities?: { name: string; description?: string; importance: number; level: number }[];
  workActivities?: { name: string; description?: string; importance: number; level: number }[];
  education?: string;
  experience?: string;
  training?: string;
  technologySkills?: string[];
  toolsUsed?: string[];
  jobZone?: number;
  salaryInfo?: { medianAnnual?: number; medianWage?: number; currency: string; period: string };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const onetOccupationSchema = new Schema<IOnetOccupation>(
  {
    occupationCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    sampleJobTitles: [{ type: String }],
    skills: [{
      name: { type: String },
      description: { type: String },
      importance: { type: Number },
      level: { type: Number },
    }],
    knowledge: [{
      name: { type: String },
      description: { type: String },
      importance: { type: Number },
      level: { type: Number },
    }],
    abilities: [{
      name: { type: String },
      description: { type: String },
      importance: { type: Number },
      level: { type: Number },
    }],
    workActivities: [{
      name: { type: String },
      description: { type: String },
      importance: { type: Number },
      level: { type: Number },
    }],
    education: { type: String },
    experience: { type: String },
    training: { type: String },
    technologySkills: [{ type: String }],
    toolsUsed: [{ type: String }],
    jobZone: { type: Number },
    salaryInfo: {
      medianAnnual: { type: Number },
      medianWage: { type: Number },
      currency: { type: String, default: 'USD' },
      period: { type: String, default: 'yearly' },
    },

    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

onetOccupationSchema.index({ title: 'text' });

export const OnetOccupation = mongoose.model<IOnetOccupation>(
  'OnetOccupation',
  onetOccupationSchema
);
