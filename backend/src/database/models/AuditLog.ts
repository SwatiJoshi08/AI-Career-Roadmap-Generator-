import mongoose, { Schema, Types } from 'mongoose';

// Note: AuditLog does not use the standard baseSchema because it should be append-only.
export interface IAuditLog extends mongoose.Document {
  actor?: Types.ObjectId;
  actorEmail?: string;
  action: string;
  targetId?: Types.ObjectId;
  targetModel?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String },
    action: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    targetModel: { type: String },
    requestId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    // No timestamps since it's immutable
  }
);

auditLogSchema.index({ actor: 1, timestamp: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
