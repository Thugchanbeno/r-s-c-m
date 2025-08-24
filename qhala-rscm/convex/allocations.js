// convex/allocations.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    projectId: v.id("projects"),
    allocationPercentage: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    role: v.string(),
    status: v.optional(
      v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled"))
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("allocations", {
      ...args,
      status: args.status || "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("allocations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("allocations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("allocations"),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("allocations").collect();
  },
});