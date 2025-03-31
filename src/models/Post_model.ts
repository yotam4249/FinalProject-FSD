
import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  imageUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    altitude?: number;
    floor?: number;
  };
  likes: Types.ObjectId[];
  eventId?: Types.ObjectId;
  expiresAt:Date
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    imageUrl: { type: String },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
      altitude: { type: Number },
      floor: { type: Number },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

postSchema.index({ location: '2dsphere' });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IPost>('Post', postSchema);
