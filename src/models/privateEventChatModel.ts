
import { Schema, model, Document, Types } from 'mongoose';
import { IMessage, MessageSchema } from './messageModel';
import { IUser } from './User_model';

export interface IEventChat extends Document {
  _id:Types.ObjectId
  // owner:string;
  // eventId: string;
  owner: Types.ObjectId; // ✅ change to ObjectId
  eventId: Types.ObjectId; 
  messages: IMessage[];
  image?: string;
}

const EventChatSchema = new Schema<IEventChat>(
  {
    // owner: { type: String, required: true }, 
    // eventId: { type: String, required: true, unique: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [MessageSchema],
    image: { type: String, default: null }
  },
  { timestamps: true }
);

export default model<IEventChat>('EventChat', EventChatSchema);
