
import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  image?: string;
}

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default model<IMessage>('Message', messageSchema);
