import UserSkills from "../../models/UserSkills.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateUserSkills() {
  console.log("Starting user skills migration...");

  await connectMongoDB();

  try {
    const userSkills = await UserSkills.find({}).lean();
    console.log(`Found ${userSkills.length} user skills to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < userSkills.length; i++) {
      const userSkill = userSkills[i];
      logProgress(i + 1, userSkills.length, "user skills");

      try {
        const userId = mappings.userIdMapping[userSkill.userId?.toString()];
        const skillId = mappings.skillIdMapping[userSkill.skillId?.toString()];

        if (!userId || !skillId) {
          console.warn(
            `⚠️ Skipping userSkill ${userSkill._id} - missing mapping: userId=${!!userId}, skillId=${!!skillId}`
          );
          continue;
        }

        const convexUserSkill = {
          userId,
          skillId,
          proficiency: userSkill.proficiency || undefined,
          interestLevel: userSkill.interestLevel || undefined,
          isCurrent: userSkill.isCurrent || false,
          isDesired: userSkill.isDesired || false,
          proofDocuments: [],
        };

        const convexId = await convex.mutation(
          api.userSkills.create,
          convexUserSkill
        );

        mappings.userSkillIdMapping[userSkill._id.toString()] = convexId;
      } catch (error) {
        console.error(
          `❌ Error migrating userSkill ${userSkill._id}:`,
          error.message
        );
      }
    }

    saveMappings(mappings);
    console.log("✅ User skills migration completed!");
  } catch (error) {
    console.error("❌ User skills migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUserSkills();
}