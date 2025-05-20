// models/Project.js
import mongoose, { Schema } from "mongoose";
import { departmentEnum, projectStatusEnum } from "@/lib/projectconstants"; // Import from new location

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    department: {
      type: String,
      required: true,
      enum: departmentEnum, // Use imported enum
      default: "Unassigned",
    },
    requiredSkills: [
      {
        skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
        skillName: { type: String, required: true },
        proficiencyLevel: { type: Number, required: true, min: 1, max: 5 },
        isRequired: { type: Boolean, required: true, default: true },
        _id: false,
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
      enum: projectStatusEnum, // Use imported enum
      default: "Planning",
      index: true,
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1, department: 1 });

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
