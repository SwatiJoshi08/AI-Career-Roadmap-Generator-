import { config } from '../config/env';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = (): number => {
  return levels[config.LOG_LEVEL as LogLevel] ?? 2;
};

export const logger = {
  error: (msg: string, ...args: any[]) => {
    if (currentLevel() >= levels.error) console.error(`[ERROR] ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    if (currentLevel() >= levels.warn) console.warn(`[WARN] ${msg}`, ...args);
  },
  info: (msg: string, ...args: any[]) => {
    if (currentLevel() >= levels.info) console.log(`[INFO] ${msg}`, ...args);
  },
  debug: (msg: string, ...args: any[]) => {
    if (currentLevel() >= levels.debug) console.debug(`[DEBUG] ${msg}`, ...args);
  },
};
