import Notification from "@/models/Notifications";
import mongoose from "mongoose";

export const NotificationTypes = {
  NEW_REQUEST: "new_request",
  REQUEST_APPROVED: "request_approved",
  REQUEST_REJECTED: "request_rejected",
  NEW_ALLOCATION: "new_allocation",
  SYSTEM_ALERT: "system_alert",
  GENERAL_INFO: "general_info",
};

export const generateNotificationLink = (type, relatedResourceId, onModel) => {
  switch (type) {
    case NotificationTypes.NEW_REQUEST:
    case NotificationTypes.REQUEST_APPROVED:
    case NotificationTypes.REQUEST_REJECTED:
      return `/resources/requests/${relatedResourceId}`; // Specific request page

    case NotificationTypes.NEW_ALLOCATION:
      return `/admin/allocations/${relatedResourceId}`;

    case NotificationTypes.SYSTEM_ALERT:
      return "/dashboard/system-alerts";

    case NotificationTypes.GENERAL_INFO:
      return "/dashboard";

    default:
      // Fallback based on onModel
      switch (onModel) {
        case "Project":
          return `/projects/${relatedResourceId}`;
        case "User":
          return `/profile/${relatedResourceId}`;
        case "ResourceRequest":
          return `/resources/requests/${relatedResourceId}`;
        case "Allocation":
          return `/admin/allocations/${relatedResourceId}`;
        default:
          return "/dashboard";
      }
  }
};

// FIXED: Remove the recursive call bug
export const createNotification = async ({
  userId,
  message,
  type,
  relatedResource = null,
  onModel = null,
  customLink = null,
}) => {
  try {
    // Generate link based on type and relatedResource
    const link =
      customLink || generateNotificationLink(type, relatedResource, onModel);

    // FIXED: Create Notification directly, not recursive call
    const notification = new Notification({
      userId,
      message,
      link,
      type,
      relatedResource,
      onModel,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Bulk notification creation
export const createBulkNotifications = async (notifications) => {
  try {
    const notificationsWithLinks = notifications.map((notif) => ({
      ...notif,
      link:
        notif.customLink ||
        generateNotificationLink(
          notif.type,
          notif.relatedResource,
          notif.onModel
        ),
    }));

    const result = await Notification.insertMany(notificationsWithLinks);
    return result;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
};
