import mongoose from "mongoose";

export interface IEvent {
  title: string;
  description: string;
  location: {
    //Each event must include a location
    type: string;
    coordinates: [number, number];
  };
  startTime: Date;
  endTime: Date;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  createdAt?: Date;
}

const eventSchema = new mongoose.Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const eventModel = mongoose.model<IEvent>("Event", eventSchema);
export default eventModel;
