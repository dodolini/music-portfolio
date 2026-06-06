import { NextResponse } from 'next/server';
import { signUpload, CLOUDINARY_FOLDER } from '../../../../lib/cloudinary';
import { isAuthenticated } from '../../../../lib/serverAuth';

export const runtime = 'nodejs';

// GET /api/cloudinary/sign — returns a short-lived signature so the admin's
// browser can upload a file directly to Cloudinary (admin only).
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder: CLOUDINARY_FOLDER };
    const { signature, apiKey, cloudName } = signUpload(paramsToSign);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder: CLOUDINARY_FOLDER,
    });
  } catch (err) {
    console.error('Error signing Cloudinary upload:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
