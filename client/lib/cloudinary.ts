import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = 'neumybeats';

/**
 * Produces the signature the browser needs to upload a file directly to
 * Cloudinary (so large audio files never pass through our serverless function,
 * which has a small request-body limit on Vercel).
 */
export function signUpload(paramsToSign: Record<string, string | number>) {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error('Missing Cloudinary environment variables');
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    CLOUDINARY_API_SECRET
  );

  return {
    signature,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
}

/** Best-effort deletion of an uploaded asset (used when a beat is removed). */
export async function destroyAsset(
  publicId?: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Failed to delete Cloudinary asset', publicId, err);
  }
}

export default cloudinary;
