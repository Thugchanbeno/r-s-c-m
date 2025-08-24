// convex/users.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    authProviderId: v.string(),
    department: v.optional(v.string()),

    function: v.union(
      v.literal("q-trust"),
      v.literal("q-lab"),
      v.literal("consultants"),
      v.literal("qhala")
    ),

    employeeType: v.union(
      v.literal("permanent"),
      v.literal("consultancy"),
      v.literal("internship"),
      v.literal("temporary")
    ),

    weeklyHours: v.number(),

    role: v.union(
      v.literal("admin"),
      v.literal("pm"),
      v.literal("hr"),
      v.literal("employee"),
      v.literal("line_manager")
    ),

    lineManagerId: v.optional(v.id("users")),

    // ✅ add the missing fields
    avatarUrl: v.optional(v.string()),
    availabilityStatus: v.union(
      v.literal("available"),
      v.literal("unavailable"),
      v.literal("on_leave")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getByFunction = query({
  args: {
    function: v.union(
      v.literal("q-trust"),
      v.literal("q-lab"),
      v.literal("consultants"),
      v.literal("qhala")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_function", (q) => q.eq("function", args.function))
      .collect();
  },
});

export const getByEmployeeType = query({
  args: {
    employeeType: v.union(
      v.literal("permanent"),
      v.literal("consultancy"),
      v.literal("internship"),
      v.literal("temporary")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_employee_type", (q) =>
        q.eq("employeeType", args.employeeType)
      )
      .collect();
  },
});
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});