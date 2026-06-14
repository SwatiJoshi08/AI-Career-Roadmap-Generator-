import { Response } from 'express';

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
    },
  });
};
