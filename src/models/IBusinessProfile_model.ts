
import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User_model';

export interface IBusiness extends IUser {
  user: Types.ObjectId;
  venueName: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    altitude?: number;
    floor?: number;
  };
  analytics: {
    visits: number;
    engagement: number;
  };
  description?: string;
  promotions: Types.ObjectId[];
}

const businessSchema = new Schema<IBusiness>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    venueName: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
      altitude: { type: Number },
      floor: { type: Number },
    },
    analytics: {
      visits: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 },
    },
    description: String,
    promotions: [{ type: Schema.Types.ObjectId, ref: 'Promotion' }],
  },
  { timestamps: true }
);

businessSchema.index({ location: '2dsphere' });

export default model<IBusiness>('Business', businessSchema);
