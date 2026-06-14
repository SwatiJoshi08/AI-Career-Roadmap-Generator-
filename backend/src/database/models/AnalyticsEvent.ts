import mongoose, { Schema, Types } from 'mongoose';

export interface IAnalyticsEvent extends mongoose.Document {
  eventName: string;
  userId?: Types.ObjectId;
  metadata?: any;
  timestamp: Date;
  sessionId?: string;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    eventName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String },
  },
  {
    // Not using base schema, since events are usually immutable logs
  }
);

analyticsEventSchema.index({ timestamp: 1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
