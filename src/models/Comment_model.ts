import mongoose from "mongoose";

export interface IComment {
    postId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt?: Date;
  }
  
  const commentSchema = new mongoose.Schema<IComment>({
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const commentModel = mongoose.model<IComment>("Comment", commentSchema);
  export default commentModel;
  