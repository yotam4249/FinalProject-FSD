
import { Schema, model, Document, Types } from 'mongoose';

export interface IChat extends Document {
  isGroup: boolean;
  users: Types.ObjectId[];
  eventId?: Types.ObjectId;
  lastMessage?: Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    isGroup: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

export default model<IChat>('Chat', chatSchema);
