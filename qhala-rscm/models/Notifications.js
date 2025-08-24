import mongoose, { Schema } from "mongoose";
import User from "./User.js";

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    link: { type: String, required: true },
    isRead: { type: Boolean, default: false, required: true, index: true },
    readAt: { type: Date, default: null },  
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
      required: true, 
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
NotificationSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ message: "text" }); 

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);