
import { Schema, model, Document, Types } from 'mongoose';

export interface IUserLocation extends Document {
  user: Types.ObjectId;
  coordinates: [number, number]; // [longitude, latitude]
  altitude?: number;
  floor?: number;
  updatedAt: Date;
}

const userLocationSchema = new Schema<IUserLocation>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    altitude: { type: Number },
    floor: { type: Number },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // we only use updatedAt manually here
  }
);

userLocationSchema.index({ coordinates: '2dsphere' });

export default model<IUserLocation>('UserLocation', userLocationSchema);
