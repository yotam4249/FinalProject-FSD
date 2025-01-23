import mongoose from "mongoose";

export interface IBusinessMessage {
    businessId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    isRead?: boolean;
    createdAt?: Date;
  }
  
  const businessMessageSchema = new mongoose.Schema<IBusinessMessage>({
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const businessMessageModel = mongoose.model<IBusinessMessage>("BusinessMessage", businessMessageSchema);
  export default businessMessageModel;
  