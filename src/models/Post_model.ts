
import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  imageUrl?: string;
  business?: Types.ObjectId; 
  location?: {
    type: 'Point';
    coordinates: [number, number];//////MAYBE CHANGE TO THE USER PLACE NAME THE PLACE NAME THAT THE USER IS INTO
    altitude?: number;
    floor?: number;
  };
  likes: Types.ObjectId[];
  eventId?: Types.ObjectId;
  expiresAt:Date
  isDeleted?: boolean;
  comments: Types.ObjectId[];
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    imageUrl: { type: String },
    business: { type: Schema.Types.ObjectId, ref: 'Business'},
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      altitude: Number,
      floor: Number
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    expiresAt: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);
postSchema.index({ content: "text", title: "text" });
postSchema.index({ location: '2dsphere' });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IPost>('Post', postSchema);
