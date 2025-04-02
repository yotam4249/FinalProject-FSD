// src/interfaces/message.interface.ts
import { Schema } from 'mongoose';

export interface IMessage {
  senderId: string;
  content?: string;
  imageUrl?: string;
  timestamp?: Date;
}

export const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true },
    content: { type: String },
    imageUrl: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);
