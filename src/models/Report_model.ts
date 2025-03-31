
import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  reporter: Types.ObjectId;
  targetType: 'post' | 'user' | 'message';
  targetId: Types.ObjectId;
  reason: string;
  resolved: boolean;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'user', 'message'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IReport>('Report', reportSchema);
