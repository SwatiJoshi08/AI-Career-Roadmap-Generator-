import { logger } from './logger';

export interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  details?: any;
}

export const logAudit = (data: AuditLogData): void => {
  logger.info(`[AUDIT] Action: ${data.action} on ${data.resource}`, {
    userId: data.userId,
    status: data.status,
    details: data.details,
  });
};
