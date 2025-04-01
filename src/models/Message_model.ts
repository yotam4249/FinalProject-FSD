
////////////private meessage model file///////////
import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  image?: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'PrivateChat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    image: { type: String,default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } });



export default model<IMessage>('Message', messageSchema);
