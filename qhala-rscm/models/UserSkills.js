import mongoose, { Schema } from "mongoose";
import Skills from "@/models/Skills.js";
import User from "@/models/User.js";

const UserSkillSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
    //proficiencyLevel: { type: String, required: true, enum: ["Beginner","Novice", "Intermediate", "Advanced","expert"], index: true },
    interestLevel: { type: Number, required: false, min: 1, max: 3 },
    isCurrent: { type: Boolean, required: true },
    // isDesired:{type:Boolean,required: false}
  },
  { timestamps: true }
);

UserSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });
export default mongoose.models.UserSkill ||
  mongoose.model("UserSkill", UserSkillSchema);
