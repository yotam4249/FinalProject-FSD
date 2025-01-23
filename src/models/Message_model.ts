import mongoose from "mongoose";

export interface IMessage {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    timestamp?: Date; // Date when the message was sent
  }
  
 
  const messageSchema = new mongoose.Schema<IMessage>({
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  });
  
  const messageModel = mongoose.model<IMessage>("Message", messageSchema);
  export default messageModel;