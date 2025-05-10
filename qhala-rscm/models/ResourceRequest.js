import mongoose, { Schema } from "mongoose";
import Project from "./Project";
import User from "./User";

const ResourceRequestSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    requestedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestedByPmId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedRole: { type: String, required: true },
    requestedPercentage: { type: Number, required: true, min: 1, max: 100 },
    requestedStartDate: { type: Date, required: false },
    requestedEndDate: { type: Date, required: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      required: true,
      index: true,
    },
    pmNotes: { type: String, required: false },
    approverNotes: { type: String, required: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    processedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

ResourceRequestSchema.index({ projectId: 1, status: 1 });
ResourceRequestSchema.index({ status: 1 });

export default mongoose.models.ResourceRequest ||
  mongoose.model("ResourceRequest", ResourceRequestSchema);
