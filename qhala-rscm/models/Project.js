import mongoose, { Schema } from "mongoose";
import Skill from "@/models/Skills.js";
import User from "@/models/User.js";

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: [
      {
        skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
        proficiencyLevel: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    nlpExtractedSkills: [{ type: String, required: false }],
    pmId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    status: {
      type: String,
      required: true,
      enum: ["Planning", "Active", "On Hold", "Completed", "Cancelled"],
      default: "Planning",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
