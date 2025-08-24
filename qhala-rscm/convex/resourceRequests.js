// convex/resourceRequests.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// -----------------
// Normal create (with auth + approval flow)
// -----------------
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    requestedUserId: v.id("users"),
    requestedRole: v.string(),
    requestedPercentage: v.number(),
    requestedStartDate: v.optional(v.number()),
    requestedEndDate: v.optional(v.number()),
    pmNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!user || !["pm", "admin", "hr"].includes(user.role)) {
      throw new Error("Forbidden");
    }

    // Check for existing pending/approved request
    const existingRequests = await ctx.db
      .query("resourceRequests")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const duplicateRequest = existingRequests.find(
      (req) =>
        req.requestedUserId === args.requestedUserId &&
        ["pending_lm", "pending_hr", "approved"].includes(req.status)
    );

    if (duplicateRequest) {
      throw new Error(
        "A pending or approved request for this user already exists"
      );
    }

    const now = Date.now();
    return await ctx.db.insert("resourceRequests", {
      ...args,
      requestedByPmId: user._id,
      status: "pending_lm",
      lineManagerApproval: {
        status: "pending",
        reason: "",
      },
      createdAt: now,
      updatedAt: now,
    });
  },
});

// -----------------
// Migration-only create (no auth, accepts all fields)
// -----------------
export const createForMigration = mutation({
  args: {
    projectId: v.id("projects"),
    requestedUserId: v.id("users"),
    requestedByPmId: v.id("users"),
    requestedRole: v.string(),
    requestedPercentage: v.number(),
    requestedStartDate: v.optional(v.number()),
    requestedEndDate: v.optional(v.number()),
    pmNotes: v.optional(v.string()),
    status: v.string(),
    approverNotes: v.optional(v.string()),
    approvedBy: v.optional(v.id("users")),
    processedAt: v.optional(v.number()),
    lineManagerApproval: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        ),
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
        approvedAt: v.optional(v.number()),
      })
    ),
    hrApproval: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        ),
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
        approvedAt: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("resourceRequests", args);
  },
});

// -----------------
// Approval flow mutations (unchanged)
// -----------------
export const processLineManagerApproval = mutation({
  args: {
    requestId: v.id("resourceRequests"),
    approved: v.boolean(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!user || !["line_manager", "admin"].includes(user.role)) {
      throw new Error("Forbidden");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending_lm") {
      throw new Error("Request not found or already processed");
    }

    const now = Date.now();
    const newStatus = args.approved ? "pending_hr" : "rejected";

    await ctx.db.patch(args.requestId, {
      status: newStatus,
      lineManagerApproval: {
        status: args.approved ? "approved" : "rejected",
        approvedBy: user._id,
        reason: args.reason,
        approvedAt: now,
      },
      updatedAt: now,
    });

    return { success: true };
  },
});

export const processHrApproval = mutation({
  args: {
    requestId: v.id("resourceRequests"),
    approved: v.boolean(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!user || !["hr", "admin"].includes(user.role)) {
      throw new Error("Forbidden");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending_hr") {
      throw new Error("Request not found or not ready for HR approval");
    }

    const now = Date.now();
    const newStatus = args.approved ? "approved" : "rejected";

    await ctx.db.patch(args.requestId, {
      status: newStatus,
      hrApproval: {
        status: args.approved ? "approved" : "rejected",
        approvedBy: user._id,
        reason: args.reason,
        approvedAt: now,
      },
      processedAt: now,
      updatedAt: now,
    });

    // If approved, create allocation
    if (args.approved) {
      await ctx.db.insert("allocations", {
        userId: request.requestedUserId,
        projectId: request.projectId,
        allocationPercentage: request.requestedPercentage,
        startDate: request.requestedStartDate || now,
        endDate: request.requestedEndDate,
        role: request.requestedRole,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// -----------------
// Queries
// -----------------
export const getAll = query({
  args: {
    status: v.optional(v.string()),
    requestedByPmId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("resourceRequests");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else if (args.requestedByPmId) {
      query = query.withIndex("by_pm", (q) =>
        q.eq("requestedByPmId", args.requestedByPmId)
      );
    }

    return await query.collect();
  },
});