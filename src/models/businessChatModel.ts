// src/models/BusinessChat_model.ts
import { Schema, model, Document, Types } from 'mongoose';
import { IMessage, MessageSchema } from './messageModel';

export interface IBusinessChat extends Document {
  _id: Types.ObjectId
  businessId: string;
  messages: IMessage[];
  image?: string;
}

const BusinessChatSchema = new Schema<IBusinessChat>(
  {
    businessId: { type: String, required: true, unique: true },
    messages: [MessageSchema],
    image: { type: String, default: null }
  },
  { timestamps: true }
);

export default model<IBusinessChat>('BusinessChat', BusinessChatSchema);
