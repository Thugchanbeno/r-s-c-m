import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    authProviderId: { type: String, required: true, unique: true, index: true },
    department: { type: String, required: false, index: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "pm", "hr", "employee"],
      index: true,
    },
    avatarUrl: { type: String, required: false },
    availabilityStatus: {
      type: String,
      enum: ["available", "unavailable", "on_leave"],
      default: "available",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
// recommend users basing  on consecutive work days or availability status for leave days or mental health check number of projects concurrently being worked on.
//auto switch availability status to unavailable if the user capacity is above 100 percent.
//assign a sub for a user basing on how close the skill of the sub match the current user.
