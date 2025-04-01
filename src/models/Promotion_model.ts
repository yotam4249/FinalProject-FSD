import { Schema, model, Document, Types } from "mongoose";

export interface IPromotion extends Document {
  title: string;
  description?: string;
  image?: string;
  startDate: Date;
  endDate: Date;
  business: Types.ObjectId;
  likes: Types.ObjectId[];
  isDeleted?: boolean;
}

const promotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true },
    description: String,
    image: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

promotionSchema.index({ title: "text", description: "text" });

export default model<IPromotion>("Promotion", promotionSchema);
