
import { Schema, model, Document } from 'mongoose';
import { IMessage, MessageSchema } from './messageModel';

interface IEventChat extends Document {
  eventId: string;
  messages: IMessage[];
  image?: string;
}

const EventChatSchema = new Schema<IEventChat>(
  {
    eventId: { type: String, required: true, unique: true },
    messages: [MessageSchema],
    image: { type: String, default: null }
  },
  { timestamps: true }
);

export default model<IEventChat>('EventChat', EventChatSchema);
