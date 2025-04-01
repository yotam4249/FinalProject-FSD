import { Schema, model, Types, Document } from 'mongoose';

export interface IPrivateChat extends Document {
  participants: [Types.ObjectId]; // שני משתמשים בדיוק
  messages: Types.ObjectId[];     // הפניות להודעות
  createdAt: Date;
  updatedAt: Date;
}

const privateChatSchema = new Schema<IPrivateChat>({
  participants: [
    { type: Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  messages: [
    { type: Schema.Types.ObjectId, ref: 'Message' }
  ]
}, { timestamps: true });

export default model<IPrivateChat>('PrivateChat', privateChatSchema);
