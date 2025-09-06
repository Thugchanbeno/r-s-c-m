// convex/activities.js
import { v } from "convex/values";
import { query } from "./_generated/server";

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

export const getRecent = query({
  args: {
    email: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const limit = args.limit || 10;

    // Aggregate activities from various sources
    const activities = [];

    try {
      // Get recent allocations for the user
      const recentAllocations = await ctx.db
        .query("allocations")
        .withIndex("by_user", (q) => q.eq("userId", actor._id))
        .order("desc")
        .take(5);

      for (const allocation of recentAllocations) {
        try {
          const project = await ctx.db.get(allocation.projectId);
          activities.push({
            id: `allocation_${allocation._id}`,
            type: "allocation",
            message: `Assigned to project "${project?.name || "Unknown Project"}"`,
            time: formatTimeAgo(allocation.createdAt),
            priority: "medium",
            createdAt: allocation.createdAt,
          });
        } catch (e) {
          console.warn("Error processing allocation:", e);
        }
      }

      // Get recent task updates
      const recentTasks = await ctx.db
        .query("tasks")
        .withIndex("by_assigned_user", (q) => q.eq("assignedUserId", actor._id))
        .order("desc")
        .take(5);

      for (const task of recentTasks) {
        try {
          const project = await ctx.db.get(task.projectId);
          activities.push({
            id: `task_${task._id}`,
            type: task.status === "completed" ? "completion" : "task",
            message:
              task.status === "completed"
                ? `Completed task "${task.title}"`
                : `Task "${task.title}" is ${task.status.replace("_", " ")}`,
            time: formatTimeAgo(task.updatedAt || task.createdAt),
            priority: mapTaskPriority(task.priority),
            createdAt: task.updatedAt || task.createdAt,
          });
        } catch (e) {
          console.warn("Error processing task:", e);
        }
      }

      // Get recent skill updates
      const recentSkills = await ctx.db
        .query("userSkills")
        .withIndex("by_user", (q) => q.eq("userId", actor._id))
        .order("desc")
        .take(3);

      for (const userSkill of recentSkills) {
        try {
          const skill = await ctx.db.get(userSkill.skillId);
          activities.push({
            id: `skill_${userSkill._id}`,
            type: "skill",
            message: `Added skill "${skill?.name || "Unknown Skill"}"`,
            time: formatTimeAgo(userSkill.createdAt),
            priority: "low",
            createdAt: userSkill.createdAt,
          });
        } catch (e) {
          console.warn("Error processing skill:", e);
        }
      }

      // Get recent work requests (leave/overtime)
      const recentRequests = await ctx.db
        .query("workRequests")
        .withIndex("by_user", (q) => q.eq("userId", actor._id))
        .order("desc")
        .take(3);

      for (const request of recentRequests) {
        try {
          activities.push({
            id: `request_${request._id}`,
            type: "request",
            message: `${request.requestType} request ${request.status.replace("_", " ")}`,
            time: formatTimeAgo(request.updatedAt || request.createdAt),
            priority: request.status === "rejected" ? "high" : "medium",
            createdAt: request.updatedAt || request.createdAt,
          });
        } catch (e) {
          console.warn("Error processing request:", e);
        }
      }

      // Get recent notifications
      const recentNotifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", actor._id))
        .order("desc")
        .take(5);

      for (const notification of recentNotifications) {
        try {
          activities.push({
            id: `notification_${notification._id}`,
            type: notification.type || "notification",
            message: notification.message,
            time: formatTimeAgo(notification.createdAt),
            priority: notification.type === "system_alert" ? "high" : "low",
            createdAt: notification.createdAt,
          });
        } catch (e) {
          console.warn("Error processing notification:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }

    // Sort by creation time and limit
    activities.sort((a, b) => b.createdAt - a.createdAt);
    return activities.slice(0, limit);
  },
});

function mapTaskPriority(priority) {
  switch (priority) {
    case "urgent":
      return "high";
    case "high":
      return "medium";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return "low";
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "Unknown time";

  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}
