// scripts/migration/validateMigration.js
import dotenv from "dotenv";
import {
  connectMongoDB,
  disconnectMongoDB,
  convex,
} from "./utils.js";
import { api } from "../../convex/_generated/api.js";

// Mongo models
import User from "../../models/User.js";
import Skills from "../../models/Skills.js";
import Project from "../../models/Project.js";
import UserSkill from "../../models/UserSkills.js";
import Allocation from "../../models/Allocation.js";
import ResourceRequest from "../../models/ResourceRequest.js";
import Notifications from "../../models/Notifications.js";
import CvCache from "../../models/CvCache.js";

dotenv.config({ path: ".env.local" });

async function validateMigration() {
  console.log("🔍 Starting migration validation...");

  await connectMongoDB();

  try {
    // Count documents in MongoDB
    const mongoStats = {
      users: await User.countDocuments(),
      skills: await Skills.countDocuments(),
      projects: await Project.countDocuments(),
      userSkills: await UserSkill.countDocuments(),
      allocations: await Allocation.countDocuments(),
      resourceRequests: await ResourceRequest.countDocuments(),
      notifications: await Notifications.countDocuments(),
      cvCache: await CvCache.countDocuments(),
    };

    const convexUsers = await convex.query(api.users.getAll, {});
const convexSkills = await convex.query(api.skills.getAll, {});
const convexProjects = await convex.query(api.projects.getAll, {});
const convexUserSkills = await convex.query(api.userSkills.getAll, {});
const convexAllocations = await convex.query(api.allocations.getAll, {});
const convexResourceRequests = await convex.query(api.resourceRequests.getAll, {});
const convexNotifications = await convex.query(api.notifications.getAll, {});
const convexCvCache = await convex.query(api.cvCache.getAll, {});

    const convexStats = {
      users: convexUsers.length,
      skills: convexSkills.length,
      projects: convexProjects.length,
      userSkills: convexUserSkills.length,
      allocations: convexAllocations.length,
      resourceRequests: convexResourceRequests.length,
      notifications: convexNotifications.length,
      cvCache: convexCvCache.length,
    };

    // Print results
    console.log("\n📊 Migration Validation Results:");
    console.log("┌────────────────────┬─────────┬─────────┬─────────┐");
    console.log("│ Entity             │ MongoDB │ Convex  │ Status  │");
    console.log("├────────────────────┼─────────┼─────────┼─────────┤");

    Object.keys(mongoStats).forEach((entity) => {
      const mongoCount = mongoStats[entity];
      const convexCount = convexStats[entity];
      const status = mongoCount === convexCount ? "✅ Match" : "❌ Mismatch";

      console.log(
        `│ ${entity.padEnd(18)} │ ${mongoCount
          .toString()
          .padStart(7)} │ ${convexCount
          .toString()
          .padStart(7)} │ ${status.padEnd(7)} │`
      );
    });

    console.log("└────────────────────┴─────────┴─────────┴─────────┘");

    const allMatch = Object.keys(mongoStats).every(
      (entity) => mongoStats[entity] === convexStats[entity]
    );

    if (allMatch) {
      console.log("\n🎉 Validation passed! All counts match.");
    } else {
      console.log("\n⚠️  Validation failed! Some counts do not match.");
      console.log("Please check the migration logs for any errors.");
    }
  } catch (error) {
    console.error("❌ Validation failed:", error);
  } finally {
    await disconnectMongoDB();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateMigration();
}

export { validateMigration };