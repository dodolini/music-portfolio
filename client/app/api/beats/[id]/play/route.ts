import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { Beat } from '../../../../../lib/models/beat';

export const runtime = 'nodejs';

// POST /api/beats/:id/play — increment the play counter (public)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const beat = await Beat.findByIdAndUpdate(
      id,
      { $inc: { plays: 1 } },
      { new: true }
    );

    if (!beat) {
      return NextResponse.json({ message: 'Beat not found' }, { status: 404 });
    }

    return NextResponse.json({ plays: beat.plays });
  } catch (error) {
    console.error('Error incrementing plays:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
