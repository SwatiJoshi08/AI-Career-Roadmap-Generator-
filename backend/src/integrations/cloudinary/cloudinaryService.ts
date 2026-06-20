import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/env';

// Initialize Cloudinary configuration
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer - File buffer (e.g., from Multer memory storage).
 * @param originalName - Original filename.
 * @param folder - Destination folder within Cloudinary (e.g., 'acrg/evidence').
 * @returns Promise resolving to relevant upload metadata.
 */
export const uploadFile = async (
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<{
  url: string;
  publicId: string;
  resourceType: string;
  fileName: string;
  fileSize: number;
}> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: originalName.replace(/\.[^/.]+$/, ''), // strip extension for public_id
        filename_override: originalName,
        resource_type: 'auto',
      },
      (error: any, result: any) => {
        if (error) {
          return reject(new Error(`Cloudinary upload error: ${error.message}`));
        }
        if (!result) {
          return reject(new Error('Cloudinary upload failed without error details'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          fileName: result.original_filename,
          fileSize: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a Cloudinary resource by its public ID.
 * @param publicId - The public ID of the resource to delete.
 */
export const deleteFile = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (error) => {
      if (error) {
        return reject(new Error(`Cloudinary delete error: ${error.message}`));
      }
      // result can be 'ok' or 'not found', treat both as success.
      resolve();
    });
  });
};
