import { Schema, model, Document } from 'mongoose';

interface IBeat extends Document {
  name: {
    pl: string;
    en: string;
  };
  fileUrl: string;
  plays: number;
  imageUrl?: string;
  isMain: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BeatSchema = new Schema<IBeat>(
  {
    name: {
      pl: { type: String, required: true },
      en: { type: String, required: true },
    },
    fileUrl: { type: String, required: true },
    plays: { type: Number, default: 0 },
    imageUrl: { type: String },
    isMain: {type: Boolean}
  },
  { timestamps: true }
);

export const Beat = model<IBeat>('Beat', BeatSchema);
