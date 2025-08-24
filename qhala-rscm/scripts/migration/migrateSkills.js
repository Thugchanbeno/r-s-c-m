import Skills from "../../models/Skills.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateSkills() {
  console.log("Starting skills migration...");

  await connectMongoDB();

  try {
    const skills = await Skills.find({}).lean();
    console.log(`Found ${skills.length} skills to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      logProgress(i + 1, skills.length, "skills");

      try {
        const convexSkill = {
          name: skill.name,
          category: skill.category || undefined,
          description: skill.description || undefined,
          aliases: skill.aliases || [],
        };

        const convexId = await convex.mutation(api.skills.create, convexSkill);

        mappings.skillIdMapping[skill._id.toString()] = convexId;
      } catch (error) {
        console.error(`Error migrating skill ${skill.name}:`, error.message);
      }
    }

    saveMappings(mappings);
    console.log("✅ Skills migration completed!");
  } catch (error) {
    console.error("❌ Skills migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSkills();
}