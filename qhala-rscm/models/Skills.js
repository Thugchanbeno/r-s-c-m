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
    category: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    aliases: {
      type: [String],
      required: false,
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

SkillSchema.pre("save", function (next) {
  if (this.isModified("aliases") && this.aliases) {
    this.aliases = this.aliases.map((alias) => alias.trim().toLowerCase());
  }
  if (this.isModified("name")) {
    this.name = this.name.trim();
  }
  if (this.isModified("category") && this.category) {
    this.category = this.category.trim();
  }
  if (this.isModified("description") && this.description) {
    this.description = this.description.trim();
  }
  next();
});

export default mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
