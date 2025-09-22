import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { createNotification, createBulkNotifications } from "./notificationUtils";

function requireRole(user, allowed) {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("You don’t have permission to perform this action.");
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
// GET /api/users
export const getAll = query({
  args: {
    email: v.string(),
    search: v.optional(v.string()),
    skillName: v.optional(v.string()),
    countOnly: v.optional(v.boolean()),
    skip: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["hr", "admin", "pm"]);

    let users = await ctx.db.query("users").collect();

    if (args.search) {
      const s = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.department || "").toLowerCase().includes(s)
      );
    }

    if (args.skillName) {
      const skills = await ctx.db
        .query("skills")
        .withIndex("by_name", (q) => q.eq("name", args.skillName))
        .collect();
      if (skills.length > 0) {
        const skillIds = skills.map((s) => s._id);
        const userSkills = await ctx.db
          .query("userSkills")
          .withIndex("by_skill", (q) => q.eq("skillId", skillIds[0]))
          .collect();
        const userIds = new Set(userSkills.map((us) => us.userId));
        users = users.filter((u) => userIds.has(u._id));
      } else {
        users = [];
      }
    }

    if (args.countOnly) return { count: users.length };

    const skip = args.skip ?? 0;
    const limit = args.limit ?? 50;
    return users.slice(skip, skip + limit);
  },
});

// GET /api/users/[id]
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// POST /api/users
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    newUserEmail: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
    availabilityStatus: v.optional(
      v.union(
        v.literal("available"),
        v.literal("unavailable"),
        v.literal("on_leave")
      )
    ),
    skills: v.optional(v.array(v.id("skills"))),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["hr", "admin"]);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.newUserEmail))
      .first();
    if (existing) throw new Error("User already exists");

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.newUserEmail,
      role: args.role,
      department: args.department,
      availabilityStatus: args.availabilityStatus || "available",
      authProviderId: "pending_invite",
      createdAt: now,
      updatedAt: now,
    });

    if (args.skills && args.skills.length > 0) {
      for (const skillId of args.skills) {
        await ctx.db.insert("userSkills", {
          userId,
          skillId,
          isCurrent: true,
          isDesired: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return userId;
  },
});
// UPDATE /api/users/[id]
export const updateProfile = mutation({
  args: {
    email: v.string(),
    id: v.id("users"),
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    availabilityStatus: v.optional(
      v.union(
        v.literal("available"),
        v.literal("unavailable"),
        v.literal("on_leave")
      )
    ),
    employeeType: v.optional(
      v.union(
        v.literal("permanent"),
        v.literal("consultancy"),
        v.literal("internship"),
        v.literal("temporary")
      )
    ),
    weeklyHours: v.optional(v.number()),
    contractStartDate: v.optional(v.number()),
    contractEndDate: v.optional(v.number()),
    paymentTerms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["hr", "admin"]);
    const { id, email, ...updates } = args;

    // Get current user state before update
    const currentUser = await ctx.db.get(args.id);
    if (!currentUser) throw new Error("User not found");

    await ctx.db.patch(args.id, { ...updates, updatedAt: Date.now() });

    // Notify user if their role changed
    if (updates.role && updates.role !== currentUser.role) {
      await createNotification(ctx, {
        userId: args.id,
        type: "user_role_changed",
        title: "Role Updated",
        message: `Your role has been updated from ${currentUser.role} to ${updates.role} by ${actor.name}`,
        link: `/profile`,
        actionUrl: `/profile`,
        requiresAction: true,
        relatedResourceId: args.id,
        relatedResourceType: "user",
        actionUserId: actor._id,
        actionUserRole: actor.role,
        contextData: {
          oldRole: currentUser.role,
          newRole: updates.role,
          updatedByName: actor.name,
        },
      });
    }

    return { success: true };
  },
});
// GET /api/users/[userId]/allocations/summary
export const getAllocationSummary = query({
  args: { email: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    if (actor._id !== args.userId && !["admin", "hr"].includes(actor.role)) {
      throw new Error(
        "You don’t have permission to view this user’s allocations."
      );
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const weeklyHours = user.weeklyHours || 40;
    const now = Date.now();

    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const active = allocations.filter(
      (a) =>
        (!a.startDate || a.startDate <= now) && (!a.endDate || a.endDate >= now)
    );

    let totalAllocatedHours = 0;
    active.forEach((a) => {
      totalAllocatedHours += (a.allocationPercentage / 100) * weeklyHours;
    });

    const totalCurrentCapacityPercentage =
      weeklyHours > 0
        ? Math.round((totalAllocatedHours / weeklyHours) * 100)
        : 0;

    return {
      userId: args.userId,
      weeklyHours,
      totalCurrentCapacityPercentage,
      totalAllocatedHours,
      activeAllocationCount: active.length,
      allocations: active,
    };
  },
});
// PATCH /api/users/[id]/status
export const updateStatus = mutation({
  args: {
    email: v.string(),
    id: v.id("users"),
    availabilityStatus: v.union(
      v.literal("available"),
      v.literal("unavailable"),
      v.literal("on_leave")
    ),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const isSelf = actor._id === args.id;
    const canEditOthers = ["admin", "hr", "line_manager"].includes(actor.role);
    if (!isSelf && !canEditOthers) {
      throw new Error(
        "You don’t have permission to update this user’s status."
      );
    }

    await ctx.db.patch(args.id, {
      availabilityStatus: args.availabilityStatus,
      updatedAt: Date.now(),
    });
    return { success: true, message: "Status updated successfully." };
  },
});
// Self-Onboarding
export const selfOnboard = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    employeeType: v.union(
      v.literal("permanent"),
      v.literal("consultancy"),
      v.literal("internship"),
      v.literal("temporary")
    ),
    weeklyHours: v.number(),
    contractStartDate: v.optional(v.number()),
    contractEndDate: v.optional(v.number()),
    paymentTerms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      throw new Error("A user with this email already exists. Please log in.");
    }

    const now = Date.now();
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "employee",
      employeeType: args.employeeType,
      weeklyHours: args.weeklyHours,
      contractStartDate: args.contractStartDate,
      contractEndDate: args.contractEndDate,
      paymentTerms: args.paymentTerms,
      availabilityStatus: "available",
      authProviderId: "pending_invite",
      createdAt: now,
      updatedAt: now,
    });
  },
});
// Assign Line Manager
export const assignLineManager = mutation({
  args: {
    email: v.string(),
    userId: v.id("users"),
    lineManagerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["admin", "hr"]);

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found.");

    const lm = await ctx.db.get(args.lineManagerId);
    if (!lm || lm.role !== "line_manager") {
      throw new Error("The selected line manager is invalid.");
    }

    await ctx.db.patch(args.userId, {
      lineManagerId: args.lineManagerId,
      updatedAt: Date.now(),
    });

    // Notify the user about their new line manager
    await createNotification(ctx, {
      userId: args.userId,
      type: "user_role_changed", // Using existing type for role/management changes
      title: "Line Manager Assigned",
      message: `${lm.name} has been assigned as your line manager by ${actor.name}`,
      link: `/profile`,
      relatedResourceId: args.userId,
      relatedResourceType: "user",
      actionUserId: actor._id,
      actionUserRole: actor.role,
      contextData: {
        lineManagerName: lm.name,
        lineManagerEmail: lm.email,
        assignedByName: actor.name,
      },
    });

    // Notify the line manager about their new direct report
    await createNotification(ctx, {
      userId: args.lineManagerId,
      type: "user_role_changed", // Using existing type for management changes
      title: "New Direct Report",
      message: `${target.name} has been assigned to report to you by ${actor.name}`,
      link: `/team`,
      actionUrl: `/team`,
      requiresAction: true,
      relatedResourceId: args.userId,
      relatedResourceType: "user",
      actionUserId: actor._id,
      actionUserRole: actor.role,
      contextData: {
        directReportName: target.name,
        directReportEmail: target.email,
        assignedByName: actor.name,
      },
    });

    return { success: true, message: "Line manager assigned successfully." };
  },
});
// Auth Integration
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});
// Create User from Auth
export const createUserFromAuth = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    authProviderId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl || "",
      authProviderId: args.authProviderId,
      role: "employee",
      availabilityStatus: "available",
      weeklyHours: 40,
      annualLeaveEntitlement: 21,
      annualLeaveUsed: 0,
      compensatoryDaysBalance: 0,
      leaveYearStartDate: new Date(new Date().getFullYear(), 0, 1).getTime(),
      createdAt: now,
      updatedAt: now,
    });

    // Notify HR and admin about new user registration
    const hrAndAdmins = await ctx.db
      .query("users")
      .filter((q) => q.or(
        q.eq(q.field("role"), "hr"),
        q.eq(q.field("role"), "admin")
      ))
      .collect();

    if (hrAndAdmins.length > 0) {
      await createBulkNotifications(ctx, {
        userIds: hrAndAdmins.map(u => u._id),
        type: "user_profile_incomplete",
        title: "New User Registration",
        message: `${args.name} (${args.email}) has registered and needs profile setup`,
        link: `/users/${userId}`,
        actionUrl: `/users/${userId}`,
        requiresAction: true,
        relatedResourceId: userId,
        relatedResourceType: "user",
        contextData: {
          userName: args.name,
          userEmail: args.email,
          registrationDate: now,
        },
      });
    }

    return userId;
  },
});
// Update User Auth
export const updateUserAuth = mutation({
  args: {
    userId: v.id("users"),
    authProviderId: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates = {
      authProviderId: args.authProviderId,
      updatedAt: Date.now(),
    };
    if (args.name) updates.name = args.name;
    if (args.avatarUrl) updates.avatarUrl = args.avatarUrl;
    return await ctx.db.patch(args.userId, updates);
  },
});
// Get Current User
export const getCurrentUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});
