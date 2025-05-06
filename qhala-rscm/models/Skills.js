import mongoose, { Schema } from "mongoose";

const SkillSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: { type: String, required: false, index: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
