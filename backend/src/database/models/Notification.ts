import mongoose, { Schema, Types } from 'mongoose';
import { IBaseDocument, baseSchemaDefinition, applyBaseSchemaSetup } from './baseSchema';

export interface INotification extends IBaseDocument {
  userId: Types.ObjectId;
  title?: string;
  body?: string;
  type?: string;
  relatedId?: Types.ObjectId;
  relatedModel?: string;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    ...baseSchemaDefinition,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String },
    body: { type: String },
    type: { type: String },
    relatedId: { type: Schema.Types.ObjectId },
    relatedModel: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: 1 });
applyBaseSchemaSetup(notificationSchema);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
