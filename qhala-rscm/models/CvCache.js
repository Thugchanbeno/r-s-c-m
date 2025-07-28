import mongoose, { Schema } from "mongoose";

const CvCacheSchema = new Schema(
  {
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    extractedSkills: [
      {
        id: { type: String },
        name: { type: String },
        category: { type: String },
        similarity: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

CvCacheSchema.index({ "extractedSkills.name": 1 });

export default mongoose.models.CvCache ||
  mongoose.model("CvCache", CvCacheSchema);
