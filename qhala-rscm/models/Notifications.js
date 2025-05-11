import mongoose, { Schema } from "mongoose";
import User from "./User";

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    link: { type: String, required: false },
    isRead: { type: Boolean, default: false, required: true, index: true },
    type: {
      type: String,
      enum: [
        "new_request",
        "request_approved",
        "request_rejected",
        "new_allocation",
        "system_alert",
        "general_info",
      ],
      required: false,
    },
    relatedResource: {
      type: Schema.Types.ObjectId,
      refPath: "onModel",
    },
    onModel: {
      type: String,
      enum: ["Project", "User", "ResourceRequest", "Allocation"],
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
