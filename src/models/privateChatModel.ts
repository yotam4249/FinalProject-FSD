// src/models/PrivateChat_model.ts
import { Schema, model, Document, Types } from 'mongoose';
import { IMessage, MessageSchema } from './messageModel';

export interface IPrivateChat extends Document {
  participants: Types.ObjectId[];// two user IDs
  messages: IMessage[];
}

const PrivateChatSchema = new Schema<IPrivateChat>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: (v: Types.ObjectId[]) => v.length === 2,
        message: 'Exactly two participants required'
      },
      required: true
    },
    messages: [MessageSchema]
  },
  { timestamps: true }
);

export default model<IPrivateChat>('PrivateChat', PrivateChatSchema);
