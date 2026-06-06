import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { Beat } from '../../../lib/models/beat';
import { getBeats, serializeBeat } from '../../../lib/beats';
import { isAuthenticated } from '../../../lib/serverAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/beats — public list of beats
export async function GET() {
  try {
    const beats = await getBeats();
    return NextResponse.json(beats);
  } catch (error) {
    console.error('Error fetching beats:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// POST /api/beats — create a beat (admin only).
// The audio/image are already uploaded to Cloudinary by the browser; the body
// just carries the resulting URLs + public ids and the metadata.
export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { namePl, nameEn, main, file, image } = body;

    if (!namePl || !nameEn || !file?.url) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const beat = await Beat.create({
      name: { pl: namePl, en: nameEn },
      fileUrl: file.url,
      filePublicId: file.publicId,
      imageUrl: image?.url ?? null,
      imagePublicId: image?.publicId ?? null,
      plays: 0,
      isMain: main === true || main === 'true',
    });

    return NextResponse.json(serializeBeat(beat), { status: 201 });
  } catch (err) {
    console.error('Error creating beat:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
