
import { Schema, model, Document, Types } from 'mongoose';

export interface IPromotion extends Document {
  business: Types.ObjectId;
  title: string;
  description: string;
  validUntil: Date;
  location: {
    type: 'Point';
    coordinates: [number, number];
    altitude?: number;
    floor?: number;
  };
}

const promotionSchema = new Schema<IPromotion>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    title: { type: String, required: true },
    description: String,
    validUntil: { type: Date, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
      altitude: { type: Number },
      floor: { type: Number },
    },
  },
  { timestamps: true }
);

promotionSchema.index({ location: '2dsphere' });

export default model<IPromotion>('Promotion', promotionSchema);
