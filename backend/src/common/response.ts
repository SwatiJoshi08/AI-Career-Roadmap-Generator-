import { v4 as uuidv4 } from 'uuid';

export interface SuccessResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    [key: string]: any;
  };
  error: null;
}

export interface ErrorResponse {
  data: null;
  meta: {
    requestId: string;
    timestamp: string;
  };
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): SuccessResponse<T> {
  const { requestId, ...otherMeta } = meta || {};
  return {
    data,
    meta: {
      requestId: requestId || uuidv4(),
      timestamp: new Date().toISOString(),
      ...otherMeta,
    },
    error: null,
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: { requestId?: string }
): ErrorResponse {
  return {
    data: null,
    meta: {
      requestId: meta?.requestId || uuidv4(),
      timestamp: new Date().toISOString(),
    },
    error: {
      code,
      message,
      details,
    },
  };
}
