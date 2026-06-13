export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Event: ${eventName}`, properties);
  }
};
