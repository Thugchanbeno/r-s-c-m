import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { canApproveResourceRequest } from "./rbac";

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (ix) => ix.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}


// GET requests
export const getAll = query({
  args: {
    email: v.string(),
    status: v.optional(v.string()),
    requestedByPmId: v.optional(v.id("users")),
    countOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    //  Permission check
    let canAccess = false;
    if (args.requestedByPmId) {
      if (
        actor._id === args.requestedByPmId ||
        ["admin", "hr", "line_manager"].includes(actor.role)
      ) {
        canAccess = true;
      }
    } else {
      if (["admin", "hr", "line_manager"].includes(actor.role))
        canAccess = true;
    }
    if (!canAccess) throw new Error("Forbidden: Insufficient permissions.");

    //  Query with correct index
    let q;
    if (args.requestedByPmId && args.status) {
      q = ctx.db
        .query("resourceRequests")
        .withIndex("by_pm_status", (ix) =>
          ix
            .eq("requestedByPmId", args.requestedByPmId)
            .eq("status", args.status)
        );
    } else if (args.requestedByPmId) {
      q = ctx.db
        .query("resourceRequests")
        .withIndex("by_pm", (ix) =>
          ix.eq("requestedByPmId", args.requestedByPmId)
        );
    } else if (args.status) {
      q = ctx.db
        .query("resourceRequests")
        .withIndex("by_status", (ix) => ix.eq("status", args.status));
    } else {
      q = ctx.db.query("resourceRequests");
    }

    let requests = await q.collect();

    if (actor.role === "line_manager") {
      const directReports = await ctx.db
        .query("users")
        .withIndex("by_line_manager", (q) => q.eq("lineManagerId", actor._id))
        .collect();
      const directReportIds = new Set(directReports.map((u) => u._id));
      requests = requests.filter((r) => directReportIds.has(r.requestedUserId));
    }

    if (args.countOnly) {
      return { count: requests.length };
    }

    // Populate related data
    const enrichedRequests = [];
    for (const req of requests) {
      const requestedUser = await ctx.db.get(req.requestedUserId);
      const project = await ctx.db.get(req.projectId);
      const requestedByPm = await ctx.db.get(req.requestedByPmId);

      enrichedRequests.push({
        ...req,
        requestedUserId: requestedUser,
        projectId: project,
        requestedByPmId: requestedByPm,
      });
    }

    return enrichedRequests.sort((a, b) => b.createdAt - a.createdAt);
  },
});
// POST request
export const create = mutation({
  args: {
    email: v.string(),
    projectId: v.id("projects"),
    requestedUserId: v.id("users"),
    requestedRole: v.string(),
    requestedPercentage: v.number(),
    requestedStartDate: v.optional(v.number()),
    requestedEndDate: v.optional(v.number()),
    pmNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (!["pm", "admin", "hr"].includes(actor.role)) {
      throw new Error("You don't have permission to perform this action.");
    }

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
      const requestedUser = await ctx.db.get(args.requestedUserId);
      const statusText =
        duplicate.status === "pending_lm"
          ? "awaiting line manager approval"
          : duplicate.status === "pending_hr"
            ? "awaiting HR approval"
            : "approved";
      throw new Error(
        `A resource request for ${requestedUser?.name || "this user"} is already ${statusText}. Please wait for it to be processed or contact your administrator if you need to modify it.`
      );
    }

    const now = Date.now();
    const { email, ...insertData } = args;
    const requestId = await ctx.db.insert("resourceRequests", {
      ...insertData,
      requestedByPmId: actor._id,
      status: "pending_lm",
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
        title: "New Resource Request",
        category: "approvals",
        priority: "high",
        type: "resource_request_pending_lm",
        link: "/resources?tab=requests",
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
    email: v.string(),
    requestId: v.id("resourceRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    canApproveResourceRequest(actor);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Resource request not found.");

    const now = Date.now();
    let updates = { updatedAt: now };
    let bypassedLM = false;

    if (request.status === "pending_lm" && actor.role === "line_manager") {
      updates.lineManagerApproval = {
        status: args.action === "approve" ? "approved" : "rejected",
        approvedBy: actor._id,
        reason: args.reason,
        approvedAt: now,
      };
      updates.status = args.action === "approve" ? "pending_hr" : "rejected";
    }
    // Admin/HR bypassing LM stage
    else if (
      request.status === "pending_lm" &&
      ["hr", "admin"].includes(actor.role)
    ) {
      bypassedLM = true;
      updates.lineManagerApproval = {
        status: args.action === "approve" ? "approved" : "rejected",
        approvedBy: actor._id,
        reason: args.reason,
        approvedAt: now,
      };
      updates.status = args.action === "approve" ? "pending_hr" : "rejected";

      if (args.action === "approve") {
        updates.hrApproval = {
          status: "approved",
          approvedBy: actor._id,
          reason: args.reason,
          approvedAt: now,
        };
        updates.status = "approved";

        const existingAlloc = await ctx.db
          .query("allocations")
          .withIndex("by_user", (ix) =>
            ix.eq("userId", request.requestedUserId)
          )
          .collect();

        const duplicate = existingAlloc.find(
          (a) => a.projectId === request.projectId
        );
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
    }
    // HR approval (after LM approval)
    else if (
      request.status === "pending_hr" &&
      ["hr", "admin"].includes(actor.role)
    ) {
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
          .withIndex("by_user", (ix) =>
            ix.eq("userId", request.requestedUserId)
          )
          .collect();

        const duplicate = existingAlloc.find(
          (a) => a.projectId === request.projectId
        );
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
      throw new Error(
        "You don't have permission to approve this request at this stage."
      );
    }

    await ctx.db.patch(args.requestId, updates);

    // Notify PM
    const notificationType =
      updates.status === "approved"
        ? "resource_request_hr_approved"
        : "resource_request_hr_rejected";

    await ctx.db.insert("notifications", {
      userId: request.requestedByPmId,
      message: `Your resource request has been ${updates.status === "approved" ? "approved" : "rejected"}.`,
      title: `Resource Request ${updates.status === "approved" ? "Approved" : "Rejected"}.`,
      category: "approvals",
      priority: updates.status === "approved" ? "high" : "medium",
      type: notificationType,
      link: `/projects/${request.projectId}`,
      relatedResourceId: args.requestId,
      relatedResourceType: "resourceRequest",
      isRead: false,
      createdAt: now,
    });

    return { success: true, bypassedLM };
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

    if (args.status)
      requests = requests.filter((r) => r.status === args.status);
    if (args.pmId)
      requests = requests.filter((r) => r.requestedByPmId === args.pmId);

    if (args.department || args.function) {
      const users = await ctx.db.query("users").collect();
      const userMap = new Map(users.map((u) => [u._id, u]));

      requests = requests.filter((r) => {
        const user = userMap.get(r.requestedUserId);
        if (!user) return false;
        if (args.department && user.department !== args.department)
          return false;
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
