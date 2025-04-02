
import { Schema, model, Document, Types } from 'mongoose';
import { IMessage, MessageSchema } from './messageModel';
import { IUser } from './User_model';

export interface IEventChat extends Document {
  _id:Types.ObjectId
  owner:IUser;
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
