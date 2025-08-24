// convex/notifications.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    link: v.optional(v.string()),
    type: v.union(
      v.literal("new_request"),
      v.literal("request_approved"),
      v.literal("request_rejected"),
      v.literal("new_allocation"),
      v.literal("task_assigned"),
      v.literal("task_completed"),
      v.literal("skill_verification"),
      v.literal("system_alert"),
      v.literal("general_info")
    ),
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(v.union(
      v.literal("project"),
      v.literal("user"),
      v.literal("resourceRequest"),
      v.literal("allocation"),
      v.literal("task"),
      v.literal("userSkill")
    )),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const getByUserId = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    isRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));
    
    const notifications = await query.collect();
    
    let filtered = notifications;
    if (args.isRead !== undefined) {
      filtered = notifications.filter(n => n.isRead === args.isRead);
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }
    
    return filtered;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
    return { success: true };
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
    
    return { success: true };
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    
    return unreadNotifications.length;
  },
});
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notifications").collect();
  },
});