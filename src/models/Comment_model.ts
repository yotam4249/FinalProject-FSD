import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  text: string;
  parentComment?: Types.ObjectId;
  replies: Types.ObjectId[];         // replies to this comment
  likes: Types.ObjectId[];           // users who liked the comment
  createdAt: Date;
  isDeleted?: boolean;
}

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },

    // Comment nesting
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],

    // Likes system
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);
commentSchema.index({ text: "text" });


export default model<IComment>('Comment', commentSchema);
