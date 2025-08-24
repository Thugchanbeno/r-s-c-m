// scripts/migration/migrateCvCache.js
import CvCache from "../../models/CvCache.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateCvCache() {
  console.log("Starting CV cache migration...");

  await connectMongoDB();

  try {
    const cvCaches = await CvCache.find({}).lean();
    console.log(`Found ${cvCaches.length} CV cache entries to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < cvCaches.length; i++) {
      const cvCache = cvCaches[i];
      logProgress(i + 1, cvCaches.length, "CV cache entries");

      try {
        const convexCvCache = {
          fileName: cvCache.fileName,
          rawText: cvCache.rawText,
          extractedSkills: cvCache.extractedSkills || [],
        };

        const convexId = await convex.mutation(
          api.cvCache.create,
          convexCvCache
        );

        // Save mapping
        mappings.cvCacheIdMapping[cvCache._id.toString()] = convexId;
      } catch (error) {
        console.error(
          `❌ Error migrating CV cache ${cvCache._id}:`,
          error.message
        );
      }
    }

    saveMappings(mappings);
    console.log("✅ CV cache migration completed!");
  } catch (error) {
    console.error("❌ CV cache migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCvCache();
}