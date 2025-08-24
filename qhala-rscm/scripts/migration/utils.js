import mongoose from "mongoose";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const mappingsFile = path.resolve("scripts/migration/mappings.json");

export async function connectMongoDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  }
}

export async function disconnectMongoDB() {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

export function logProgress(current, total, entity) {
  const percentage = ((current / total) * 100).toFixed(1);
  console.log(`Migrating ${entity}: ${current}/${total} (${percentage}%)`);
}

export function saveMappings(mappings) {
  fs.writeFileSync(mappingsFile, JSON.stringify(mappings, null, 2));
  console.log("💾 Saved ID mappings to", mappingsFile);
}

export function loadMappings() {
  if (fs.existsSync(mappingsFile)) {
    const data = JSON.parse(fs.readFileSync(mappingsFile, "utf-8"));
    console.log("📂 Loaded ID mappings from", mappingsFile);
    return data;
  }
  return {
    userIdMapping: {},
    skillIdMapping: {},
    projectIdMapping: {},
    userSkillIdMapping: {},
    allocationIdMapping: {},
    resourceRequestIdMapping: {},
    notificationIdMapping: {},
    cvCacheIdMapping: {},
  };
}

export { convex, api };