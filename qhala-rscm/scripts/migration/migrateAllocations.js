import Allocation from "../../models/Allocation.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateAllocations() {
  console.log("Starting allocations migration...");

  await connectMongoDB();

  try {
    const allocations = await Allocation.find({}).lean();
    console.log(`Found ${allocations.length} allocations to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < allocations.length; i++) {
      const allocation = allocations[i];
      logProgress(i + 1, allocations.length, "allocations");

      try {
        const userId = mappings.userIdMapping[allocation.userId?.toString()];
        const projectId = mappings.projectIdMapping[allocation.projectId?.toString()];

        if (!userId || !projectId) {
          console.warn(
            `⚠️ Skipping allocation ${allocation._id} - missing mapping: userId=${!!userId}, projectId=${!!projectId}`
          );
          continue;
        }

        const convexAllocation = {
          userId,
          projectId,
          allocationPercentage: allocation.allocationPercentage,
          startDate: allocation.startDate ? allocation.startDate.getTime() : undefined,
          endDate: allocation.endDate ? allocation.endDate.getTime() : undefined,
          role: allocation.role || "Developer",
          status: allocation.status || "active",
        };

        const convexId = await convex.mutation(api.allocations.create, convexAllocation);

        mappings.allocationIdMapping[allocation._id.toString()] = convexId;
      } catch (error) {
        console.error(
          `❌ Error migrating allocation ${allocation._id}:`,
          error.message
        );
      }
    }

    saveMappings(mappings);
    console.log("✅ Allocations migration completed!");
  } catch (error) {
    console.error("❌ Allocations migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAllocations();
}