
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  refreshTokens?: string[];
  phone?: string;
  bio?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  profileImage?: string;
  isBusiness?: boolean;
  isPremium?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    refreshTokens: { type: [String], default: [] },
    bio: String,
    age: Number,
    gender: String,
    interests: [String],
    profileImage: String,
    isBusiness: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);
