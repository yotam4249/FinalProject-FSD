// src/models/BusinessChat_model.ts
import { Schema, model, Document, Types } from 'mongoose';
import { IMessage, MessageSchema } from './messageModel';
import { IPost, postSchema } from './Post_model';

export interface IBusinessChat extends Document {
  _id: Types.ObjectId
  businessId: string;
  posts: Types.ObjectId[]; 
  image?: string;
}

const BusinessChatSchema = new Schema<IBusinessChat>(
  {
    businessId: { type: String, required: true, unique: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    image: { type: String, default: null }
  },
  { timestamps: true }
);

export default model<IBusinessChat>('BusinessChat', BusinessChatSchema);
