// scripts/migration/migrateNotifications.js
import Notifications from "../../models/Notifications.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateNotifications() {
  console.log("Starting notifications migration...");

  await connectMongoDB();

  try {
    const notifications = await Notifications.find({}).lean();
    console.log(`Found ${notifications.length} notifications to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      logProgress(i + 1, notifications.length, "notifications");

      try {
        const userId = mappings.userIdMapping[notification.userId?.toString()];
        if (!userId) {
          console.warn(
            `⚠️ Skipping notification ${notification._id} - missing user mapping`
          );
          continue;
        }

        // Map related resource
        let relatedResourceId = undefined;
        let relatedResourceType = undefined;

        if (notification.relatedResource && notification.onModel) {
          const resourceId = notification.relatedResource.toString();

          switch (notification.onModel) {
            case "Project":
              relatedResourceId = mappings.projectIdMapping[resourceId];
              relatedResourceType = "project";
              break;
            case "User":
              relatedResourceId = mappings.userIdMapping[resourceId];
              relatedResourceType = "user";
              break;
            case "ResourceRequest":
              relatedResourceId = mappings.resourceRequestIdMapping[resourceId];
              relatedResourceType = "resourceRequest";
              break;
            case "Allocation":
              relatedResourceId = mappings.allocationIdMapping[resourceId];
              relatedResourceType = "allocation";
              break;
          }
        }

        const convexNotification = {
          userId,
          message: notification.message,
          link: notification.link || undefined,
          type: notification.type || "general_info",
          relatedResourceId: relatedResourceId || undefined,
          relatedResourceType: relatedResourceType || undefined,
        };

        const convexId = await convex.mutation(
          api.notifications.create,
          convexNotification
        );

        // Mark as read if needed
        if (notification.isRead) {
          await convex.mutation(api.notifications.markAsRead, { id: convexId });
        }

        // Save mapping
        mappings.notificationIdMapping[notification._id.toString()] = convexId;
      } catch (error) {
        console.error(
          `❌ Error migrating notification ${notification._id}:`,
          error.message
        );
      }
    }

    saveMappings(mappings);
    console.log("✅ Notifications migration completed!");
  } catch (error) {
    console.error("❌ Notifications migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateNotifications();
}