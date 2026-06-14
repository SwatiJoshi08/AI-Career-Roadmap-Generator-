import mongoose, { Schema } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';
import { Role } from './enums';

export interface IUser extends IBaseDocument {
  email: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  lastLoginAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    ...baseSchemaDefinition,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(Role), required: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).passwordHash;
        return ret;
      },
    },
  }
);

applyBaseSchemaSetup(userSchema);

export const User = mongoose.model<IUser>('User', userSchema);
