import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

export const getAll = query({
  args: {
    email: v.string(),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    requiresAction: v.optional(v.boolean()),
    search: v.optional(v.string()),
    dateRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    let notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (ix) => ix.eq("userId", user._id))
      .collect();

    // Apply filters
    if (args.status === "read") {
      notifications = notifications.filter((n) => n.isRead);
    } else if (args.status === "unread") {
      notifications = notifications.filter((n) => !n.isRead);
    }

    if (args.type && args.type !== "all") {
      notifications = notifications.filter((n) => n.type === args.type);
    }

    if (args.category && args.category !== "all") {
      notifications = notifications.filter((n) => n.category === args.category);
    }

    if (args.priority && args.priority !== "all") {
      notifications = notifications.filter((n) => n.priority === args.priority);
    }

    if (args.requiresAction !== undefined) {
      notifications = notifications.filter(
        (n) => n.requiresAction === args.requiresAction && !n.actionCompleted
      );
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      notifications = notifications.filter((n) =>
        n.message.toLowerCase().includes(s)
      );
    }
    if (args.dateRange && args.dateRange !== "all") {
      const now = Date.now();
      let startDate;
      if (args.dateRange === "today") {
        const d = new Date();
        startDate = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate()
        ).getTime();
      } else if (args.dateRange === "week") {
        startDate = now - 7 * 24 * 60 * 60 * 1000;
      } else if (args.dateRange === "month") {
        const d = new Date();
        startDate = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      }
      if (startDate) {
        notifications = notifications.filter((n) => n.createdAt >= startDate);
      }
    }

    const page = args.page ?? 1;
    const limit = args.limit ?? 20;
    const skip = (page - 1) * limit;
    const paginated = notifications.slice(skip, skip + limit);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      data: paginated,
      currentPage: page,
      totalPages: Math.ceil(notifications.length / limit),
      totalCount: notifications.length,
      unreadCount,
    };
  },
});

export const markAsRead = mutation({
  args: {
    email: v.string(),
    notificationIds: v.optional(v.array(v.id("notifications"))),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    let modifiedCount = 0;
    if (args.notificationIds && args.notificationIds.length > 0) {
      for (const id of args.notificationIds) {
        const notif = await ctx.db.get(id);
        if (notif && notif.userId === user._id && !notif.isRead) {
          await ctx.db.patch(id, { isRead: true });
          modifiedCount++;
        }
      }
    } else {
      const notifs = await ctx.db
        .query("notifications")
        .withIndex("by_user", (ix) => ix.eq("userId", user._id))
        .collect();
      for (const n of notifs.filter((n) => !n.isRead)) {
        await ctx.db.patch(n._id, { isRead: true });
        modifiedCount++;
      }
    }

    return { success: true, modifiedCount };
  },
});

export const remove = mutation({
  args: {
    email: v.string(),
    notificationIds: v.array(v.id("notifications")),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    let deletedCount = 0;
    for (const id of args.notificationIds) {
      const notif = await ctx.db.get(id);
      if (notif && notif.userId === user._id) {
        await ctx.db.delete(id);
        deletedCount++;
      }
    }
    return { success: true, deletedCount };
  },
});

export const getUnreadCount = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_user", (ix) => ix.eq("userId", user._id))
      .collect();

    return { count: notifs.filter((n) => !n.isRead).length };
  },
});

export const update = mutation({
  args: {
    email: v.string(),
    id: v.id("notifications"),
    isRead: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    if (notif.userId !== user._id) throw new Error("Forbidden");

    const updates = {};
    if (args.isRead !== undefined) updates.isRead = args.isRead;
    if (args.isArchived !== undefined) updates.isArchived = args.isArchived;

    await ctx.db.patch(args.id, updates);
    return { success: true };
  },
});

export const cleanupOld = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const oldNotifs = await ctx.db
      .query("notifications")
      .withIndex("by_created_at", (ix) => ix.lt("createdAt", ninetyDaysAgo))
      .collect();

    for (const n of oldNotifs) {
      await ctx.db.delete(n._id);
    }

    return { success: true, deleted: oldNotifs.length };
  },
});

export const updatePreferences = mutation({
  args: {
    email: v.string(),
    preferences: v.object({
      // Legacy preferences for backward compatibility
      new_request: v.optional(v.boolean()),
      request_approved: v.optional(v.boolean()),
      request_rejected: v.optional(v.boolean()),
      new_allocation: v.optional(v.boolean()),
      task_assigned: v.optional(v.boolean()),
      task_completed: v.optional(v.boolean()),
      skill_verification: v.optional(v.boolean()),
      system_alert: v.optional(v.boolean()),
      general_info: v.optional(v.boolean()),

      // Enhanced category-based preferences
      user_management: v.optional(v.boolean()),
      skills_verification: v.optional(v.boolean()),
      projects: v.optional(v.boolean()),
      resources: v.optional(v.boolean()),
      approvals: v.optional(v.boolean()),
      tasks: v.optional(v.boolean()),
      system: v.optional(v.boolean()),
      analytics: v.optional(v.boolean()),

      // Priority-based preferences
      critical_only: v.optional(v.boolean()),
      high_and_above: v.optional(v.boolean()),
      medium_and_above: v.optional(v.boolean()),
      all_priorities: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    await ctx.db.patch(user._id, {
      notificationPreferences: args.preferences,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getByCategory = query({
  args: {
    email: v.string(),
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_category", (ix) =>
        ix.eq("userId", user._id).eq("category", args.category)
      )
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

export const getByPriority = query({
  args: {
    email: v.string(),
    priority: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_priority", (ix) =>
        ix.eq("userId", user._id).eq("priority", args.priority)
      )
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

export const getActionRequired = query({
  args: {
    email: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_requires_action", (ix) =>
        ix.eq("userId", user._id).eq("requiresAction", true)
      )
      .filter((q) => q.eq(q.field("actionCompleted"), false))
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

export const getSummaryStats = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (ix) => ix.eq("userId", user._id))
      .collect();

    const stats = {
      total: notifications.length,
      unread: 0,
      actionRequired: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      byCategory: {
        user_management: 0,
        skills_verification: 0,
        projects: 0,
        resources: 0,
        approvals: 0,
        tasks: 0,
        system: 0,
        analytics: 0,
      },
    };

    for (const notification of notifications) {
      if (!notification.isRead) stats.unread++;
      if (notification.requiresAction && !notification.actionCompleted) {
        stats.actionRequired++;
      }
      if (notification.priority) {
        stats.byPriority[notification.priority]++;
      }
      if (notification.category) {
        stats.byCategory[notification.category]++;
      }
    }

    return stats;
  },
});
