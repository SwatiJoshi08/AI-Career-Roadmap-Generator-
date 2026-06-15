import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';
import { config } from '../../config/env';
import { ValidationError } from '../../common/errors';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg']);

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  fileName: string;
  fileSize: number;
  resourceType: string;
}

const validateFile = (buffer: Buffer, fileName: string) => {
  const extension = path.extname(fileName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new ValidationError('INVALID_FILE_TYPE');
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError('FILE_TOO_LARGE');
  }
};

export const uploadFile = async (
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<CloudinaryUploadResult> => {
  validateFile(buffer, fileName);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve(uploadResult);
      }
    );

    stream.end(buffer);
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    fileName,
    fileSize: buffer.length,
    resourceType: result.resource_type,
  };
};

export const deleteFile = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
};
