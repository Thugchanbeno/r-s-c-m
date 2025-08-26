import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function requireRole(user, allowed) {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("You don’t have permission to perform this action.");
  }
}

// GET requests
export const getAll = query({
  args: {
    status: v.optional(v.string()),
    requestedByPmId: v.optional(v.id("users")),
    countOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_email", (ix) => ix.eq("email", identity.email))
      .first();
    if (!actor) throw new Error("User not found");

    let canAccess = false;
    if (args.requestedByPmId) {
      if (actor._id === args.requestedByPmId || ["admin", "hr"].includes(actor.role)) {
        canAccess = true;
      }
    } else {
      if (["admin", "hr"].includes(actor.role)) canAccess = true;
    }
    if (!canAccess) throw new Error("Forbidden: Insufficient permissions.");

    let q = ctx.db.query("resourceRequests");
    if (args.status) q = q.withIndex("by_status", (ix) => ix.eq("status", args.status));
    if (args.requestedByPmId) {
      q = q.withIndex("by_pm", (ix) => ix.eq("requestedByPmId", args.requestedByPmId));
    }

    const requests = await q.collect();
    if (args.countOnly) return { count: requests.length };
    return requests;
  },
});

// POST request
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

    const actor = await ctx.db
      .query("users")
      .withIndex("by_email", (ix) => ix.eq("email", identity.email))
      .first();
    if (!actor) throw new Error("User not found");
    requireRole(actor, ["pm", "admin", "hr"]);

    if (args.requestedPercentage < 1 || args.requestedPercentage > 100) {
      throw new Error("Allocation percentage must be between 1 and 100.");
    }

    // Prevent duplicate pending/approved requests
    const existing = await ctx.db
      .query("resourceRequests")
      .withIndex("by_project", (ix) => ix.eq("projectId", args.projectId))
      .collect();

    const duplicate = existing.find(
      (r) =>
        r.requestedUserId === args.requestedUserId &&
        ["pending_lm", "pending_hr", "approved"].includes(r.status)
    );
    if (duplicate) {
      throw new Error("A pending or approved request for this user already exists.");
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("resourceRequests", {
      ...args,
      requestedByPmId: actor._id,
      status: "pending_lm", // start with LM approval
      lineManagerApproval: { status: "pending", reason: "" },
      hrApproval: { status: "pending", reason: "" },
      createdAt: now,
      updatedAt: now,
    });

    // Notify LM
    const requestedUser = await ctx.db.get(args.requestedUserId);
    if (requestedUser?.lineManagerId) {
      await ctx.db.insert("notifications", {
        userId: requestedUser.lineManagerId,
        message: `New resource request for ${requestedUser.name} requires your approval.`,
        link: "/resources?tab=requests",
        type: "new_request",
        relatedResourceId: requestId,
        relatedResourceType: "resourceRequest",
        isRead: false,
        createdAt: now,
      });
    }

    return requestId;
  },
});

// Multi-step approval (LM → HR)
export const processApproval = mutation({
  args: {
    requestId: v.id("resourceRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_email", (ix) => ix.eq("email", identity.email))
      .first();
    if (!actor) throw new Error("User not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Resource request not found.");

    const now = Date.now();
    let updates = { updatedAt: now };

    // LM approval
    if (request.status === "pending_lm" && actor.role === "line_manager") {
      updates.lineManagerApproval = {
        status: args.action === "approve" ? "approved" : "rejected",
        approvedBy: actor._id,
        reason: args.reason,
        approvedAt: now,
      };
      updates.status = args.action === "approve" ? "pending_hr" : "rejected";
    }
    // HR approval
    else if (request.status === "pending_hr" && ["hr", "admin"].includes(actor.role)) {
      updates.hrApproval = {
        status: args.action === "approve" ? "approved" : "rejected",
        approvedBy: actor._id,
        reason: args.reason,
        approvedAt: now,
      };
      updates.status = args.action === "approve" ? "approved" : "rejected";

      // Auto-create allocation if approved
      if (args.action === "approve") {
        const existingAlloc = await ctx.db
          .query("allocations")
          .withIndex("by_user", (ix) => ix.eq("userId", request.requestedUserId))
          .collect();

        const duplicate = existingAlloc.find((a) => a.projectId === request.projectId);
        if (!duplicate) {
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
      }
    } else {
      throw new Error("You don’t have permission to approve this request at this stage.");
    }

    await ctx.db.patch(args.requestId, updates);

    // Notify PM
    await ctx.db.insert("notifications", {
      userId: request.requestedByPmId,
      message: `Your resource request has been ${updates.status}.`,
      link: `/projects/${request.projectId}`,
      type: updates.status === "approved" ? "request_approved" : "request_rejected",
      relatedResourceId: args.requestId,
      relatedResourceType: "resourceRequest",
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});

// Reporting: requests by status, PM, department, function
export const getReport = query({
  args: {
    status: v.optional(v.string()),
    pmId: v.optional(v.id("users")),
    department: v.optional(v.string()),
    function: v.optional(
      v.union(
        v.literal("q-trust"),
        v.literal("q-lab"),
        v.literal("consultants"),
        v.literal("qhala")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_email", (ix) => ix.eq("email", identity.email))
      .first();
    requireRole(actor, ["admin", "hr"]);

    let requests = await ctx.db.query("resourceRequests").collect();

    if (args.status) requests = requests.filter((r) => r.status === args.status);
    if (args.pmId) requests = requests.filter((r) => r.requestedByPmId === args.pmId);

    if (args.department || args.function) {
      const users = await ctx.db.query("users").collect();
      const userMap = new Map(users.map((u) => [u._id, u]));

      requests = requests.filter((r) => {
        const user = userMap.get(r.requestedUserId);
        if (!user) return false;
        if (args.department && user.department !== args.department) return false;
        if (args.function && user.function !== args.function) return false;
        return true;
      });
    }

    return {
      total: requests.length,
      byStatus: requests.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}),
      requests,
    };
  },
});