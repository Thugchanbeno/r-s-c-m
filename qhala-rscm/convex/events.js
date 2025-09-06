// convex/events.js
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

export const getUpcoming = query({
  args: {
    email: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const limit = args.limit || 5;
    const now = Date.now();
    const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const events = [];

    try {
      // Get upcoming task due dates
      const upcomingTasks = await ctx.db
        .query("tasks")
        .withIndex("by_assigned_user", (q) => q.eq("assignedUserId", actor._id))
        .collect();

      const dueTasks = upcomingTasks.filter(
        (task) =>
          task.dueDate &&
          task.dueDate > now &&
          task.dueDate <= oneWeekFromNow &&
          task.status !== "completed"
      );

      for (const task of dueTasks) {
        try {
          events.push({
            id: `task_due_${task._id}`,
            title: `Task Due: ${task.title}`,
            date: formatDate(task.dueDate),
            type: "task_due",
            priority: task.priority || "medium",
          });
        } catch (e) {
          console.warn("Error processing task due date:", e);
        }
      }

      // Get upcoming project milestones
      const userAllocations = await ctx.db
        .query("allocations")
        .withIndex("by_user", (q) => q.eq("userId", actor._id))
        .collect();

      for (const allocation of userAllocations) {
        try {
          const project = await ctx.db.get(allocation.projectId);
          if (
            project?.endDate &&
            project.endDate > now &&
            project.endDate <= oneWeekFromNow
          ) {
            events.push({
              id: `project_end_${project._id}`,
              title: `Project Deadline: ${project.name}`,
              date: formatDate(project.endDate),
              type: "project_deadline",
              priority: "high",
            });
          }
        } catch (e) {
          console.warn("Error processing project deadline:", e);
        }
      }

      // Get upcoming leave/work requests
      const upcomingRequests = await ctx.db
        .query("workRequests")
        .withIndex("by_user", (q) => q.eq("userId", actor._id))
        .collect();

      const pendingRequests = upcomingRequests.filter(
        (request) =>
          request.startDate &&
          request.startDate > now &&
          request.startDate <= oneWeekFromNow &&
          request.status === "approved"
      );

      for (const request of pendingRequests) {
        try {
          events.push({
            id: `request_${request._id}`,
            title: `${request.requestType === "leave" ? "Leave" : "Overtime"}: ${request.reason || "Scheduled"}`,
            date: formatDate(request.startDate),
            type: request.requestType,
            priority: "medium",
          });
        } catch (e) {
          console.warn("Error processing work request:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    }

    // Sort by date and limit
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    return events.slice(0, limit);
  },
});

function formatDate(timestamp) {
  if (!timestamp) return "No date";

  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
