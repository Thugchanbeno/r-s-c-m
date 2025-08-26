import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function requireRole(user, allowed) {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("You don’t have permission to perform this action.");
  }
}

// Helper: fetch actor by email (from NextAuth session)
async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

// GET allocations (with filters + pagination)
export const getAll = query({
  args: {
    email: v.string(), // ✅ pass from NextAuth session
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const isAdminOrHR = ["admin", "hr"].includes(actor.role);

    if (args.userId || args.projectId) {
      let canAccess = false;
      if (args.userId && actor._id === args.userId) canAccess = true;
      if (isAdminOrHR) canAccess = true;
      if (!canAccess) {
        throw new Error("You don’t have permission to view these allocations.");
      }
    } else {
      if (!isAdminOrHR) {
        throw new Error("You don’t have permission to view all allocations.");
      }
    }

    let q = ctx.db.query("allocations");
    if (args.userId) {
      q = q.withIndex("by_user", (ix) => ix.eq("userId", args.userId));
    }
    if (args.projectId) {
      q = q.withIndex("by_project", (ix) => ix.eq("projectId", args.projectId));
    }

    const all = await q.collect();
    const page = args.page ?? 1;
    const limit = args.limit ?? 10;
    const skip = (page - 1) * limit;

    const paginated = all.slice(skip, skip + limit);

    return {
      count: paginated.length,
      totalAllocations: all.length,
      currentPage: page,
      totalPages: Math.ceil(all.length / limit),
      data: paginated,
    };
  },
});

// CREATE allocation
export const create = mutation({
  args: {
    email: v.string(),
    userId: v.id("users"),
    projectId: v.id("projects"),
    allocationPercentage: v.number(),
    role: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["admin", "hr"]);

    if (args.allocationPercentage < 0 || args.allocationPercentage > 100) {
      throw new Error("Allocation percentage must be between 0 and 100.");
    }

    if (args.startDate && args.endDate && args.startDate > args.endDate) {
      throw new Error("End date cannot be before start date.");
    }

    // Prevent overlapping allocations
    const existing = await ctx.db
      .query("allocations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const newStart = args.startDate || Date.now();
    const newEnd = args.endDate || new Date(9999, 11, 31).getTime();

    for (const alloc of existing) {
      const existingStart = alloc.startDate || 0;
      const existingEnd = alloc.endDate || new Date(9999, 11, 31).getTime();
      if (newStart <= existingEnd && newEnd >= existingStart) {
        throw new Error("This user already has an overlapping allocation.");
      }
    }

    const now = Date.now();
    return await ctx.db.insert("allocations", {
      userId: args.userId,
      projectId: args.projectId,
      allocationPercentage: args.allocationPercentage,
      role: args.role,
      startDate: args.startDate || now,
      endDate: args.endDate || null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// UPDATE allocation
export const update = mutation({
  args: {
    email: v.string(),
    id: v.id("allocations"),
    allocationPercentage: v.optional(v.number()),
    role: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["admin", "hr"]);

    const allocation = await ctx.db.get(args.id);
    if (!allocation) throw new Error("Allocation not found.");

    if (
      args.allocationPercentage != null &&
      (args.allocationPercentage < 0 || args.allocationPercentage > 100)
    ) {
      throw new Error("Allocation percentage must be between 0 and 100.");
    }

    if (args.startDate && args.endDate && args.startDate > args.endDate) {
      throw new Error("End date cannot be before start date.");
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// DELETE allocation
export const remove = mutation({
  args: { email: v.string(), id: v.id("allocations") },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["admin", "hr"]);

    await ctx.db.delete(args.id);
    return { success: true, message: "Allocation deleted successfully." };
  },
});

// GET allocation summary (enhanced with overtime + leave + department/function)
export const getSummary = query({
  args: {
    email: v.string(),
    pmId: v.optional(v.id("users")),
    scope: v.optional(v.string()), // "overall", "department", "function"
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
    const actor = await getActor(ctx, args.email);
    const now = Date.now();

    async function getAdjustedHours(user) {
      const weeklyHours = user.weeklyHours || 40;
      let availableHours = weeklyHours;

      // Subtract approved leave
      const leaveRequests = await ctx.db
        .query("workRequests")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("requestType", "leave")
        )
        .collect();

      const approvedLeave = leaveRequests.filter(
        (lr) => lr.status === "approved" && lr.startDate <= now && lr.endDate >= now
      );

      let leaveDays = 0;
      for (const lr of approvedLeave) {
        leaveDays += lr.daysRequested;
      }
      availableHours -= leaveDays * 8;

      // Add approved overtime (time_off)
      const overtimeRequests = await ctx.db
        .query("workRequests")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("requestType", "overtime")
        )
        .collect();

      const approvedOvertime = overtimeRequests.filter(
        (ot) => ot.status === "approved" && ot.compensationType === "time_off"
      );

      let overtimeHours = 0;
      for (const ot of approvedOvertime) {
        overtimeHours += ot.overtimeHours;
      }
      availableHours += overtimeHours;

      return availableHours;
    }

    async function calculateUtilization(users) {
      let totalAllocatedHours = 0;
      let totalAvailableHours = 0;

      for (const user of users) {
        const adjustedHours = await getAdjustedHours(user);
        totalAvailableHours += adjustedHours;

        const allocations = await ctx.db
          .query("allocations")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const active = allocations.filter(
          (a) =>
            (!a.startDate || a.startDate <= now) &&
            (!a.endDate || a.endDate >= now)
        );

        let userAllocatedHours = 0;
        active.forEach((a) => {
          userAllocatedHours += (a.allocationPercentage / 100) * adjustedHours;
        });

        totalAllocatedHours += userAllocatedHours;
      }

      return {
        utilizationPercentage:
          totalAvailableHours > 0
            ? Math.round((totalAllocatedHours / totalAvailableHours) * 100)
            : 0,
        totalAllocatedHours,
        totalAvailableHours,
        userCount: users.length,
      };
    }

    if (args.scope === "overall") {
      requireRole(actor, ["admin", "hr"]);
      const allUsers = await ctx.db.query("users").collect();
      return await calculateUtilization(allUsers);
    }

    if (args.scope === "department" && args.department) {
      requireRole(actor, ["admin", "hr"]);
      const deptUsers = await ctx.db
        .query("users")
        .withIndex("by_department", (q) => q.eq("department", args.department))
        .collect();
      return await calculateUtilization(deptUsers);
    }

    if (args.scope === "function" && args.function) {
      requireRole(actor, ["admin", "hr"]);
      const funcUsers = await ctx.db
        .query("users")
        .withIndex("by_function", (q) => q.eq("function", args.function))
        .collect();
      return await calculateUtilization(funcUsers);
    }

    if (args.pmId) {
      if (actor._id !== args.pmId && !["admin", "hr"].includes(actor.role)) {
        throw new Error("You can only view your own summary or have admin/hr privileges.");
      }

      const pmProjects = await ctx.db
        .query("projects")
        .withIndex("by_pm", (q) => q.eq("pmId", args.pmId))
        .collect();

      const pmProjectIds = pmProjects.map((p) => p._id);

      if (pmProjectIds.length > 0) {
        const allocations = await ctx.db.query("allocations").collect();
        const uniqueUsers = new Set(
          allocations
            .filter((a) => pmProjectIds.includes(a.projectId))
            .map((a) => a.userId)
        );
        return { uniqueUserCount: uniqueUsers.size };
      } else {
        return { uniqueUserCount: 0 };
      }
    }

    throw new Error("Missing required scope or pmId parameter.");
  },
});