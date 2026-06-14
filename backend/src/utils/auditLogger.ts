import { Types } from 'mongoose';
import { AuditLog } from '../database/models';

interface AuditLogOptions {
  actor?: string | Types.ObjectId;
  actorEmail?: string;
  action: string;
  targetId?: string | Types.ObjectId;
  targetModel?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export const logAudit = async (options: AuditLogOptions): Promise<void> => {
  try {
    await AuditLog.create({
      actor: options.actor,
      actorEmail: options.actorEmail,
      action: options.action,
      targetId: options.targetId,
      targetModel: options.targetModel,
      requestId: options.requestId,
      ip: options.ip,
      userAgent: options.userAgent,
    });
  } catch (error) {
    console.error('[Audit Logger] Failed to create audit log:', error);
    // We typically don't throw an error here to prevent audit logging failures from breaking business logic
  }
};
