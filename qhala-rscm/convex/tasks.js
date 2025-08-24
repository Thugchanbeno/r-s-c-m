// convex/tasks.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    assignedTo: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    dueDate: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();
    
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      ...args,
      createdBy: user._id,
      status: "todo",
      createdAt: now,
      updatedAt: now,
    });

    // Update project task count
    const project = await ctx.db.get(args.projectId);
    if (project) {
      await ctx.db.patch(args.projectId, {
        taskCount: (project.taskCount || 0) + 1,
        updatedAt: now,
      });
    }

    return taskId;
  },
});

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getByAssignedUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assigned_user", (q) => q.eq("assignedTo", args.userId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("review"), v.literal("done"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: now,
    });

    // Update project completed task count if task is completed
    if (args.status === "done" && task.status !== "done") {
      const project = await ctx.db.get(task.projectId);
      if (project) {
        await ctx.db.patch(task.projectId, {
          completedTaskCount: (project.completedTaskCount || 0) + 1,
          updatedAt: now,
        });
      }
    }

    return { success: true };
  },
});