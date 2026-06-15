import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { errorResponse } from '../common/response';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'INVALID_FILE_TYPE'));
      return;
    }

    cb(null, true);
  },
});

export const handleMulterError = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    const code = err.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'INVALID_FILE_TYPE';
    return res.status(400).json(
      errorResponse(code, code)
    );
  }

  return next(err);
};
