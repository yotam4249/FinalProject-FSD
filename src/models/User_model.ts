import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  picture?: string;
  _id?: mongoose.Types.ObjectId;
  refreshTokens?: string[];
  location?: {
    type: string;
    coordinates: [number, number];
  };
  isLocationVisible?: boolean;
  createdAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  picture: { type: String, default: "../../public/photos/avatar.png" },
  refreshTokens: { type: [String], default: [] },
  location: {
    type: {
      type: String,
      enum: ["Point"], // Geography according to GeoJSON
      default: "Point",
    },
    coordinates: {
      type: [Number], // array of coordinates: [longitude, latitude]
      default: undefined,
    },
  },
  isLocationVisible: {
    type: Boolean,
    default: false, // User privacy - default not to share location
  },
  createdAt: { type: Date, default: Date.now },
});

const userModel = mongoose.model<IUser>("User", userSchema);
export default userModel;
