import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { Beat } from '../../../../lib/models/beat';
import { isAuthenticated } from '../../../../lib/serverAuth';
import { destroyAsset } from '../../../../lib/cloudinary';

export const runtime = 'nodejs';

// DELETE /api/beats/:id — remove a beat and its Cloudinary assets (admin only)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    const deleted = await Beat.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: 'Beat not found' }, { status: 404 });
    }

    // Audio is uploaded with resource_type "video" on Cloudinary; images as "image".
    await destroyAsset(deleted.filePublicId, 'video');
    await destroyAsset(deleted.imagePublicId, 'image');

    return NextResponse.json({ message: 'Beat deleted successfully' });
  } catch (err) {
    console.error('Error deleting beat:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
