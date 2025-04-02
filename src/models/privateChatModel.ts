// src/models/PrivateChat_model.ts
import { Schema, model, Document } from 'mongoose';
import { IMessage, MessageSchema } from './messageModel';

interface IPrivateChat extends Document {
  participants: [string, string]; // two user IDs
  messages: IMessage[];
}

const PrivateChatSchema = new Schema<IPrivateChat>(
  {
    participants: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length === 2, 'Exactly two participants required']
    },
    messages: [MessageSchema]
  },
  { timestamps: true }
);

export default model<IPrivateChat>('PrivateChat', PrivateChatSchema);
