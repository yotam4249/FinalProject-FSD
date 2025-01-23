import mongoose from "mongoose";
   
export interface IPost {
  content: string;
  mediaUrl?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  expiresAt?: Date;
  createdAt?: Date;
}

const postSchema = new mongoose.Schema<IPost>({
  content: { type: String, required: true },
  mediaUrl: { type: String },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  createdAt: { type: Date, default: Date.now },
});

const postModel = mongoose.model<IPost>("Post", postSchema);
export default postModel;
