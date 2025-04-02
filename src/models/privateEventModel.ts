
import { Schema, model, Document, Types } from 'mongoose';
export interface IEvent extends Document {
  _id:Types.ObjectId
  name: string;
  host: Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number];
    altitude?: number;
    floor?: number;
  };
  imageUrl?: String,
  startTime: Date;
  expiresAt: Date;
  participants: Types.ObjectId[];
  description?: string;
}

const eventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
      altitude: { type: Number },
      floor: { type: Number },
    },
    imageUrl: {type: String ,default: null}, // Default image URL
    startTime: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    description: String,
  },
  { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });

export default model<IEvent>('Event', eventSchema);
