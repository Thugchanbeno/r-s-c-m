import mongoose, { Schema } from "mongoose";
import User from "@/models/User.js";
import Project from "@/models/Project.js";

const AllocationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    allocationPercentage: { type: Number, required: true, min: 0, max: 100 },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    role: {
      type: String,
      required: true,
      enum: ["Lead developer", "Developer", "Tester", "Manager", "Admin"],
      default: "Developer",
    },
  },
  { timestamps: true }
);

AllocationSchema.index({ userId: 1, startDate: 1, endDate: 1 });
AllocationSchema.index({ projectId: 1 });

export default mongoose.models.Allocation ||
  mongoose.model("Allocation", AllocationSchema);
