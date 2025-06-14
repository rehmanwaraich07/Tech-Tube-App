import type mongoose from "mongoose";
import { Schema, model, models } from "mongoose";

export const VIDEO_DIMENSIONS = {
  width: 1080,
  height: 1920,
} as const;

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    width: number;
    height: number;
    quality?: number;
  };
  // User information
  uploadedBy?: {
    id: string;
    email: string;
    name?: string;
  };
  views?: number;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    controls: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS.height },
      width: { type: Number, default: VIDEO_DIMENSIONS.width },
      quality: { type: Number, min: 1, max: 100 },
    },
    uploadedBy: {
      id: { type: String },
      email: { type: String },
      name: { type: String },
    },
    views: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Video = models?.Video || model<IVideo>("Video", videoSchema);

export default Video;
