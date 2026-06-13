import { logger } from './logger';

export interface AnalyticsEventData {
  userId?: string;
  eventType: string;
  properties?: Record<string, any>;
}

export const logAnalyticsEvent = (data: AnalyticsEventData): void => {
  logger.debug(`[ANALYTICS] Event: ${data.eventType}`, {
    userId: data.userId,
    properties: data.properties,
  });
};
