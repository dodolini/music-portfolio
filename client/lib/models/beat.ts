import { Schema, model, models, Model, Document } from 'mongoose';

export interface IBeat extends Document {
  name: {
    pl: string;
    en: string;
  };
  fileUrl: string;
  filePublicId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  plays: number;
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
    filePublicId: { type: String },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    plays: { type: Number, default: 0 },
    isMain: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Reuse the compiled model across hot-reloads / serverless invocations.
export const Beat: Model<IBeat> =
  (models.Beat as Model<IBeat>) || model<IBeat>('Beat', BeatSchema);
