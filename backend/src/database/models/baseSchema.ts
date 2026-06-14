import { Schema, Document, Types } from 'mongoose';

export interface IBaseDocument extends Document {
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status?: string;
  version: number;
  deletedAt?: Date | null;
  metadata?: any;
}

export const baseSchemaDefinition = {
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String },
  version: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
};

/**
 * Helper to apply base plugins/hooks to all schemas.
 */
export function applyBaseSchemaSetup(schema: Schema) {
  // Pre-find hook to exclude soft-deleted documents
  schema.pre(/^find/, function (this: any, next) {
    if (this.getQuery().deletedAt === undefined) {
      this.where({ deletedAt: null });
    }
    next();
  });
}
