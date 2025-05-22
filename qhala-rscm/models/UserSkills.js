import mongoose, { Schema } from "mongoose";

const UserSkillSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
      index: true,
    },
    proficiency: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
      index: true,
    },
    interestLevel: { type: Number, required: false, min: 1, max: 3 },
    isCurrent: { type: Boolean, required: true, default: false },
    isDesired: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

UserSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

export default mongoose.models.UserSkill ||
  mongoose.model("UserSkill", UserSkillSchema);
