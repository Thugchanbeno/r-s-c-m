import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { createNotification } from "./notificationUtils";

function requireRole(user, allowed) {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("You don't have permission to perform this action.");
  }
}

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

function getCurrentLeaveYear() {
  return new Date().getFullYear();
}

function calculateBusinessDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

// GET all work requests
export const getAll = query({
  args: {
    email: v.string(),
    requestType: v.optional(
      v.union(v.literal("leave"), v.literal("overtime"), v.literal("compensatory_leave"))
    ),
    status: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    skip: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    let q = ctx.db.query("workRequests");
    if (args.requestType) {
      q = q.withIndex("by_request_type", (ix) => ix.eq("requestType", args.requestType));
    }
    if (args.userId) {
      q = q.withIndex("by_user", (ix) => ix.eq("userId", args.userId));
    }

    let requests = await q.collect();
    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }

    if (!["admin", "hr", "pm", "line_manager"].includes(actor.role)) {
      requests = requests.filter((r) => r.userId === actor._id);
    }

    const skip = args.skip ?? 0;
    const limit = args.limit ?? 50;
    return requests.slice(skip, skip + limit);
  },
});

// CREATE leave request
export const createLeaveRequest = mutation({
  args: {
    email: v.string(),
    leaveType: v.union(
      v.literal("annual"),
      v.literal("sick"),
      v.literal("personal"),
      v.literal("emergency"),
      v.literal("maternity"),
      v.literal("paternity")
    ),
    startDate: v.number(),
    endDate: v.number(),
    reason: v.string(),
    coveringUserId: v.optional(v.id("users")),
    handoverNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const daysRequested = calculateBusinessDays(args.startDate, args.endDate);
    const currentYear = getCurrentLeaveYear();

    const leaveBalance = await ctx.db
      .query("leaveBalances")
      .withIndex("by_user_year", (q) => q.eq("userId", user._id).eq("leaveYear", currentYear))
      .first();

    if (leaveBalance && args.leaveType === "annual") {
      if (leaveBalance.annualLeaveRemaining < daysRequested) {
        throw new Error(
          `Insufficient leave balance. You have ${leaveBalance.annualLeaveRemaining} days remaining.`
        );
      }
    }

    const now = Date.now();
    return await ctx.db.insert("workRequests", {
      userId: user._id,
      requestType: "leave",
      leaveType: args.leaveType,
      startDate: args.startDate,
      endDate: args.endDate,
      daysRequested,
      reason: args.reason,
      coveringUserId: args.coveringUserId,
      handoverNotes: args.handoverNotes,
      status: "pending_lm",
      lineManagerApproval: { status: "pending", reason: "" },
      createdAt: now,
      updatedAt: now,
    });
  },
});

// CREATE overtime request
export const createOvertimeRequest = mutation({
  args: {
    email: v.string(),
    projectId: v.optional(v.id("projects")),
    overtimeHours: v.number(),
    overtimeDate: v.number(),
    reason: v.string(),
    compensationType: v.union(v.literal("time_off"), v.literal("payment"), v.literal("both")),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const now = Date.now();
    return await ctx.db.insert("workRequests", {
      userId: user._id,
      requestType: "overtime",
      projectId: args.projectId,
      overtimeHours: args.overtimeHours,
      overtimeDate: args.overtimeDate,
      reason: args.reason,
      compensationType: args.compensationType,
      status: "pending_lm",
      lineManagerApproval: { status: "pending", reason: "" },
      createdAt: now,
      updatedAt: now,
    });
  },
});

// PROCESS approval workflow
export const processApproval = mutation({
  args: {
    email: v.string(),
    requestId: v.id("workRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");

    const now = Date.now();
    let updates = { updatedAt: now };

    if (request.status === "pending_lm" && actor.role === "line_manager") {
      updates.lineManagerApproval = {
        status: args.action === "approve" ? "approved" : "rejected",
        approvedBy: actor._id,
        reason: args.reason,
        approvedAt: now,
      };
      updates.status = args.action === "approve" ? "pending_pm" : "rejected";
      if (args.action === "approve") updates.pmApproval = { status: "pending", reason: "" };
    } else if (request.status === "pending_pm" && actor.role === "pm") {
      updates.pmApproval = {
        status: args.action === "approve" ? "approved" : "rejected",
        approvedBy: actor._id,
        reason: args.reason,
        approvedAt: now,
      };
      updates.status = args.action === "approve" ? "pending_hr" : "rejected";
      if (args.action === "approve") updates.hrApproval = { status: "pending", reason: "" };
    } else if (request.status === "pending_hr" && ["hr", "admin"].includes(actor.role)) {
      updates.hrApproval = {
        status: args.action === "approve" ? "approved" : "rejected",
        approvedBy: actor._id,
        reason: args.reason,
        approvedAt: now,
      };
      if (args.action === "approve") {
        updates.status = "approved";
        if (request.requestType === "leave") {
          await updateLeaveBalance(ctx, request.userId, request.daysRequested, "use");
        } else if (request.requestType === "overtime" && request.compensationType === "time_off") {
          const compDays = Math.ceil(request.overtimeHours / 8);
          updates.compensationDaysAwarded = compDays;
          await updateLeaveBalance(ctx, request.userId, compDays, "award");
        }
      } else {
        updates.status = "rejected";
      }
    } else {
      throw new Error("You don't have permission to approve this request at this stage.");
    }

    await ctx.db.patch(args.requestId, updates);

    // Determine notification type based on approval stage and action
    let notificationType;
    if (args.action === "approve") {
      if (request.status === "approved") {
        notificationType = request.requestType === "leave" ? "leave_request_approved" : "overtime_request_approved";
      } else {
        // Still pending further approval
        notificationType = request.requestType === "leave" ? "leave_request_pending_pm" : "resource_request_pending_hr";
      }
    } else {
      notificationType = request.requestType === "leave" ? "leave_request_rejected" : "overtime_request_rejected";
    }

    const requestTypeDisplay = request.requestType === "leave" ? "leave" : "overtime";
    const approverRole = actor.role === "line_manager" ? "Line Manager" : 
                        actor.role === "pm" ? "Project Manager" : "HR";
    
    let message;
    if (args.action === "approve" && request.status !== "approved") {
      message = `Your ${requestTypeDisplay} request has been approved by ${approverRole} (${actor.name}) and is pending further approval`;
    } else {
      message = `Your ${requestTypeDisplay} request has been ${args.action}d by ${approverRole} (${actor.name})`;
    }

    await createNotification(ctx, {
      userId: request.userId,
      type: notificationType,
      title: `${requestTypeDisplay === "leave" ? "Leave" : "Overtime"} Request ${args.action === "approve" ? "Approved" : "Rejected"}`,
      message,
      link: `/requests/${args.requestId}`,
      actionUrl: args.action === "reject" ? `/requests/new` : undefined,
      requiresAction: args.action === "reject",
      relatedResourceId: args.requestId,
      relatedResourceType: "workRequest",
      actionUserId: actor._id,
      actionUserRole: actor.role,
      contextData: {
        requestType: request.requestType,
        approvalStage: request.status,
        approverName: actor.name,
        approverRole: actor.role,
        reason: args.reason,
        actionUserName: actor.name,
        actionUserAvatar: actor.avatarUrl,
      },
    });

    return { success: true };
  },
});

// Helper: update leave balance
async function updateLeaveBalance(ctx, userId, days, action) {
  const currentYear = getCurrentLeaveYear();
  let balance = await ctx.db
    .query("leaveBalances")
    .withIndex("by_user_year", (q) => q.eq("userId", userId).eq("leaveYear", currentYear))
    .first();

  if (!balance) {
    const balanceId = await ctx.db.insert("leaveBalances", {
      userId,
      leaveYear: currentYear,
      annualLeaveEntitlement: 21,
      annualLeaveUsed: 0,
      compensatoryDaysBalance: 0,
      compensatoryDaysUsed: 0,
      annualLeaveRemaining: 21,
      totalAvailableDays: 21,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    balance = await ctx.db.get(balanceId);
  }

  let updates = { updatedAt: Date.now() };
  if (action === "use") {
    updates.annualLeaveUsed = balance.annualLeaveUsed + days;
    updates.annualLeaveRemaining = balance.annualLeaveEntitlement - updates.annualLeaveUsed;
  } else if (action === "award") {
    updates.compensatoryDaysBalance = balance.compensatoryDaysBalance + days;
  }

  updates.totalAvailableDays =
    (updates.annualLeaveRemaining ?? balance.annualLeaveRemaining) +
    (updates.compensatoryDaysBalance ?? balance.compensatoryDaysBalance) -
    balance.compensatoryDaysUsed;

  await ctx.db.patch(balance._id, updates);
}

// GET leave balance
export const getLeaveBalance = mutation({
  args: { email: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const targetUserId = args.userId || actor._id;

    if (targetUserId !== actor._id && !["admin", "hr", "line_manager"].includes(actor.role)) {
      throw new Error("You can only view your own leave balance.");
    }

    const currentYear = getCurrentLeaveYear();
    let balance = await ctx.db
      .query("leaveBalances")
      .withIndex("by_user_year", (q) => q.eq("userId", targetUserId).eq("leaveYear", currentYear))
      .first();

    if (!balance) {
      const balanceId = await ctx.db.insert("leaveBalances", {
        userId: targetUserId,
        leaveYear: currentYear,
        annualLeaveEntitlement: 21,
        annualLeaveUsed: 0,
        compensatoryDaysBalance: 0,
        compensatoryDaysUsed: 0,
        annualLeaveRemaining: 21,
        totalAvailableDays: 21,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      balance = await ctx.db.get(balanceId);
    }

    return balance;
  },
});

// CANCEL request
export const cancelRequest = mutation({
  args: { email: v.string(), requestId: v.id("workRequests") },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    if (request.userId !== actor._id) {
      throw new Error("You can only cancel your own requests.");
    }
    if (request.status === "approved") {
      throw new Error("Cannot cancel an approved request. Please contact HR.");
    }

    await ctx.db.patch(args.requestId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
export const getByUser = query({
  args: {
    email: v.string(),
    userId: v.optional(v.id("users")),   // ✅ optional now
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const targetUserId = args.userId || actor._id;   // ✅ fallback to self

    if (targetUserId !== actor._id && !["admin", "hr", "pm", "line_manager"].includes(actor.role)) {
      throw new Error("You don’t have permission to view this user’s requests.");
    }

    let q = ctx.db.query("workRequests").withIndex("by_user", (ix) =>
      ix.eq("userId", targetUserId)
    );

    let requests = await q.collect();
    requests.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      requests = requests.slice(0, args.limit);
    }

    return requests;
  },
});