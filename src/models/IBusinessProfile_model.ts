import mongoose from "mongoose";

export interface IBusinessProfile {
    ownerId: mongoose.Types.ObjectId;
    businessName: string;
    description: string;
    promotions: string[];
    analytics: {
      visits: number;
      engagement: number;
    };
    createdAt?: Date;
  }
  
  const businessProfileSchema = new mongoose.Schema<IBusinessProfile>({
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    promotions: {
      type: [String],
      default: [],
    },
    analytics: {
      visits: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const businessProfileModel = mongoose.model<IBusinessProfile>("BusinessProfile", businessProfileSchema);
  export default businessProfileModel;
  