import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { createNotification } from "./notificationUtils";

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

export const createEvent = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    eventCategory: v.union(
      v.literal("seminar"),
      v.literal("meeting"),
      v.literal("webinar"),
      v.literal("conference"),
      v.literal("training"),
      v.literal("other")
    ),
    location: v.optional(v.string()),
    startDateTime: v.number(),
    endDateTime: v.number(),
    notes: v.optional(v.string()),
    attendees: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    if (args.startDateTime >= args.endDateTime) {
      throw new Error("Event end time must be after start time.");
    }

    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      userId: user._id,
      title: args.title,
      description: args.description,
      eventCategory: args.eventCategory,
      location: args.location,
      startDateTime: args.startDateTime,
      endDateTime: args.endDateTime,
      notes: args.notes,
      attendees: args.attendees || [],
      acknowledgedBy: [],
      status: "planned",
      eventDate: args.startDateTime,
      createdAt: now,
      updatedAt: now,
    });

    await createNotification(ctx, {
      userId: user._id,
      type: "event_created",
      title: "Event Logged",
      message: `You logged an out-of-office event: "${args.title}"`,
      link: `/profile#events`,
      relatedResourceId: eventId,
      relatedResourceType: "event",
      actionUserId: user._id,
      actionUserRole: user.role,
    });

    if (user.lineManagerId) {
      await createNotification(ctx, {
        userId: user.lineManagerId,
        type: "event_logged",
        title: "Team Member Event",
        message: `${user.name} logged an out-of-office event: "${args.title}"`,
        link: `/profile#events`,
        relatedResourceId: eventId,
        relatedResourceType: "event",
        actionUserId: user._id,
        actionUserRole: user.role,
      });
    }

    return eventId;
  },
});

export const updateEvent = mutation({
  args: {
    email: v.string(),
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    eventCategory: v.optional(
      v.union(
        v.literal("seminar"),
        v.literal("meeting"),
        v.literal("webinar"),
        v.literal("conference"),
        v.literal("training"),
        v.literal("other")
      )
    ),
    location: v.optional(v.string()),
    startDateTime: v.optional(v.number()),
    endDateTime: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("planned"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    attendees: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);
    const event = await ctx.db.get(args.eventId);

    if (!event) throw new Error("Event not found.");
    if (event.userId !== user._id && !["admin", "hr"].includes(user.role)) {
      throw new Error("You can only update your own events.");
    }

    if (args.startDateTime && args.endDateTime && args.startDateTime >= args.endDateTime) {
      throw new Error("Event end time must be after start time.");
    }

    const updates = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.eventCategory !== undefined) updates.eventCategory = args.eventCategory;
    if (args.location !== undefined) updates.location = args.location;
    if (args.startDateTime !== undefined) {
      updates.startDateTime = args.startDateTime;
      updates.eventDate = args.startDateTime;
    }
    if (args.endDateTime !== undefined) updates.endDateTime = args.endDateTime;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.status !== undefined) updates.status = args.status;
    if (args.attendees !== undefined) updates.attendees = args.attendees;
    updates.updatedAt = Date.now();

    await ctx.db.patch(args.eventId, updates);
    return { success: true };
  },
});

export const deleteEvent = mutation({
  args: {
    email: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);
    const event = await ctx.db.get(args.eventId);

    if (!event) throw new Error("Event not found.");
    if (event.userId !== user._id && !["admin", "hr"].includes(user.role)) {
      throw new Error("You can only delete your own events.");
    }

    await ctx.db.delete(args.eventId);
    return { success: true, message: "Event deleted successfully." };
  },
});

export const acknowledgeEvent = mutation({
  args: {
    email: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (!["admin", "hr"].includes(actor.role)) {
      throw new Error("You don't have permission to acknowledge events.");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found.");

    const acknowledgedBy = event.acknowledgedBy || [];
    if (!acknowledgedBy.includes(actor._id)) {
      acknowledgedBy.push(actor._id);
    }

    await ctx.db.patch(args.eventId, {
      acknowledgedBy,
      updatedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId: event.userId,
      type: "event_acknowledged",
      title: "Event Acknowledged",
      message: `${actor.name} acknowledged your event "${event.title}".`,
      link: `/profile#events`,
      relatedResourceId: args.eventId,
      relatedResourceType: "event",
      actionUserId: actor._id,
      actionUserRole: actor.role,
    });

    return { success: true };
  },
});

export const getByUser = query({
  args: {
    email: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    if (actor._id !== args.userId && !["admin", "hr"].includes(actor.role)) {
      throw new Error("You can only view your own events.");
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return events.sort((a, b) => b.startDateTime - a.startDateTime);
  },
});

export const getByDateRange = query({
  args: {
    email: v.string(),
    startDateTime: v.number(),
    endDateTime: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const limit = args.limit || 50;

    const events = await ctx.db
      .query("events")
      .filter((q) => q.and(
        q.gte(q.field("startDateTime"), args.startDateTime),
        q.lte(q.field("endDateTime"), args.endDateTime)
      ))
      .collect();

    let filteredEvents = [];

    if (actor.role === "line_manager") {
      const directReports = await ctx.db
        .query("users")
        .withIndex("by_line_manager", (q) => q.eq("lineManagerId", actor._id))
        .collect();
      const directReportIds = new Set(directReports.map((u) => u._id));
      filteredEvents = events
        .filter((e) => directReportIds.has(e.userId))
        .sort((a, b) => b.startDateTime - a.startDateTime)
        .slice(0, limit);
    } else if (["admin", "hr"].includes(actor.role)) {
      filteredEvents = events.sort((a, b) => b.startDateTime - a.startDateTime).slice(0, limit);
    } else {
      filteredEvents = events
        .filter((e) => e.userId === actor._id)
        .sort((a, b) => b.startDateTime - a.startDateTime)
        .slice(0, limit);
    }

    for (const event of filteredEvents) {
      if (event.attendees && event.attendees.length > 0) {
        event.attendeesList = await Promise.all(
          event.attendees.map(id => ctx.db.get(id)).filter(Boolean)
        );
      }
    }

    return filteredEvents;
  },
});

export const getTeamEvents = query({
  args: {
    email: v.string(),
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const days = args.days || 7;
    const limit = args.limit || 50;
    const now = Date.now();
    const startTime = now;
    const endTime = now + days * 24 * 60 * 60 * 1000;

    let events = [];

    if (actor.role === "line_manager") {
      const directReports = await ctx.db
        .query("users")
        .withIndex("by_line_manager", (q) => q.eq("lineManagerId", actor._id))
        .collect();
      const directReportIds = new Set(directReports.map((u) => u._id));

      const allEvents = await ctx.db.query("events").collect();
      events = allEvents.filter((e) =>
        directReportIds.has(e.userId) &&
        e.startDateTime >= startTime &&
        e.startDateTime <= endTime
      );
    } else if (["admin", "hr"].includes(actor.role)) {
      const allEvents = await ctx.db.query("events").collect();
      events = allEvents.filter((e) =>
        e.startDateTime >= startTime &&
        e.startDateTime <= endTime
      );
    }

    return events.sort((a, b) => b.startDateTime - a.startDateTime).slice(0, limit);
  },
});

export const getPendingAcknowledgment = query({
  args: {
    email: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (!["admin", "hr"].includes(actor.role)) {
      throw new Error("You don't have permission to view pending events.");
    }

    const limit = args.limit || 50;
    const allEvents = await ctx.db.query("events").collect();
    const now = Date.now();

    const pendingEvents = allEvents
      .filter((event) => {
        const acknowledgedBy = event.acknowledgedBy || [];
        return !acknowledgedBy.includes(actor._id) && event.startDateTime >= now;
      })
      .sort((a, b) => a.startDateTime - b.startDateTime)
      .slice(0, limit);

    for (const event of pendingEvents) {
      if (event.userId) {
        event.user = await ctx.db.get(event.userId);
      }
      if (event.attendees && event.attendees.length > 0) {
        event.attendeesList = await Promise.all(
          event.attendees.map(id => ctx.db.get(id)).filter(Boolean)
        );
      }
    }

    return pendingEvents;
  },
});
