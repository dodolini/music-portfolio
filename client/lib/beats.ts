import { connectToDatabase } from './mongodb';
import { Beat, IBeat } from './models/beat';

export interface SerializedBeat {
  id: string;
  name: { pl: string; en: string };
  fileUrl: string;
  imageUrl: string | null;
  plays: number;
  main: boolean;
}

export function serializeBeat(beat: IBeat): SerializedBeat {
  return {
    id: (beat._id as { toString(): string }).toString(),
    name: beat.name,
    fileUrl: beat.fileUrl,
    imageUrl: beat.imageUrl ?? null,
    plays: beat.plays,
    main: beat.isMain,
  };
}

/** Fetch all beats straight from the database (no HTTP round-trip). */
export async function getBeats(): Promise<SerializedBeat[]> {
  await connectToDatabase();
  const beats = await Beat.find().sort({ createdAt: -1 });
  return beats.map(serializeBeat);
}
