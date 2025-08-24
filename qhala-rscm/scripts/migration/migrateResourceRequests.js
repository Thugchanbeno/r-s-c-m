// scripts/migration/migrateResourceRequests.js
import ResourceRequest from "../../models/ResourceRequest.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateResourceRequests() {
  console.log("Starting resource requests migration...");

  await connectMongoDB();

  try {
    const resourceRequests = await ResourceRequest.find({}).lean();
    console.log(`Found ${resourceRequests.length} resource requests to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < resourceRequests.length; i++) {
      const request = resourceRequests[i];
      logProgress(i + 1, resourceRequests.length, "resource requests");

      try {
        const projectId = mappings.projectIdMapping[request.projectId?.toString()];
        const requestedUserId =
          mappings.userIdMapping[request.requestedUserId?.toString()];
        const requestedByPmId =
          mappings.userIdMapping[request.requestedByPmId?.toString()];
        const approvedBy = request.approvedBy
          ? mappings.userIdMapping[request.approvedBy.toString()]
          : undefined;

        if (!projectId || !requestedUserId || !requestedByPmId) {
          console.warn(
            `⚠️ Skipping resource request ${request._id} - missing mapping: projectId=${!!projectId}, requestedUserId=${!!requestedUserId}, requestedByPmId=${!!requestedByPmId}`
          );
          continue;
        }

        // Map old status to new workflow
        let newStatus = "pending_lm";
        let lineManagerApproval = { status: "pending", reason: "" };
        let hrApproval = undefined;

        if (request.status === "approved") {
          newStatus = "approved";
          lineManagerApproval = {
            status: "approved",
            approvedBy,
            reason: request.approverNotes || "Migrated from old system",
            approvedAt: request.processedAt
              ? request.processedAt.getTime()
              : Date.now(),
          };
          hrApproval = {
            status: "approved",
            approvedBy,
            reason: request.approverNotes || "Migrated from old system",
            approvedAt: request.processedAt
              ? request.processedAt.getTime()
              : Date.now(),
          };
        } else if (request.status === "rejected") {
          newStatus = "rejected";
          lineManagerApproval = {
            status: "rejected",
            approvedBy,
            reason: request.approverNotes || "Migrated from old system",
            approvedAt: request.processedAt
              ? request.processedAt.getTime()
              : Date.now(),
          };
        } else if (request.status === "cancelled") {
          newStatus = "cancelled";
        }

        const convexResourceRequest = {
          projectId,
          requestedUserId,
          requestedByPmId,
          requestedRole: request.requestedRole,
          requestedPercentage: request.requestedPercentage,
          requestedStartDate: request.requestedStartDate
            ? request.requestedStartDate.getTime()
            : undefined,
          requestedEndDate: request.requestedEndDate
            ? request.requestedEndDate.getTime()
            : undefined,
          pmNotes: request.pmNotes || undefined,
          status: newStatus,
          approverNotes: request.approverNotes || undefined,
          approvedBy,
          processedAt: request.processedAt
            ? request.processedAt.getTime()
            : undefined,
          lineManagerApproval,
          hrApproval,
          createdAt: request.createdAt ? request.createdAt.getTime() : Date.now(),
          updatedAt: request.updatedAt ? request.updatedAt.getTime() : Date.now(),
        };

        const convexId = await convex.mutation(
          api.resourceRequests.createForMigration,
          convexResourceRequest
        );

        mappings.resourceRequestIdMapping[request._id.toString()] = convexId;
      } catch (error) {
        console.error(
          `❌ Error migrating resource request ${request._id}:`,
          error.message
        );
      }
    }

    saveMappings(mappings);
    console.log("✅ Resource requests migration completed!");
  } catch (error) {
    console.error("❌ Resource requests migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateResourceRequests();
}