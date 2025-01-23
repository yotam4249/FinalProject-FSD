import mongoose from "mongoose";

export interface IProfile {
    userId: mongoose.Types.ObjectId;
    name: string;
    bio?: string;     // Short bio of the user
    avatar?: string;    // URL to the profile picture
    interests?: string[]; // List of interests
    createdAt?: Date;   // Date when the profile was created
  }
  
  
  const profileSchema = new mongoose.Schema<IProfile>({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "../../public/photos/avatar.png",
    },
    interests: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const profileModel = mongoose.model<IProfile>("Profile", profileSchema);
  export default profileModel;
  