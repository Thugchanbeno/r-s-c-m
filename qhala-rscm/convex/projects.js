// convex/projects.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    department: v.optional(v.string()), // ✅ optional now
    function: v.optional(
      v.union(
        v.literal("q-trust"),
        v.literal("q-lab"),
        v.literal("consultants"),
        v.literal("qhala")
      )
    ),
    requiredSkills: v.optional(
      v.array(
        v.object({
          skillId: v.id("skills"),
          skillName: v.string(),
          proficiencyLevel: v.number(),
          isRequired: v.boolean(),
        })
      )
    ),
    nlpExtractedSkills: v.optional(v.array(v.string())),
    pmId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("On Hold"),
        v.literal("Completed"),
        v.literal("Cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("projects", {
      ...args,
      department: args.department || "Unassigned", // ✅ default if missing
      requiredSkills: args.requiredSkills || [],   // ✅ default if missing
      status: args.status || "Planning",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getAll = query({
  args: {
    pmId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    department: v.optional(v.string()),
    function: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("projects");

    if (args.pmId) {
      query = query.withIndex("by_pm", (q) => q.eq("pmId", args.pmId));
    } else if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else if (args.department) {
      query = query.withIndex("by_department", (q) =>
        q.eq("department", args.department)
      );
    } else if (args.function) {
      query = query.withIndex("by_function", (q) =>
        q.eq("function", args.function)
      );
    }

    return await query.collect();
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    department: v.optional(v.string()),
    function: v.optional(
      v.union(
        v.literal("q-trust"),
        v.literal("q-lab"),
        v.literal("consultants"),
        v.literal("qhala")
      )
    ),
    requiredSkills: v.optional(
      v.array(
        v.object({
          skillId: v.id("skills"),
          skillName: v.string(),
          proficiencyLevel: v.number(),
          isRequired: v.boolean(),
        })
      )
    ),
    status: v.optional(
      v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("On Hold"),
        v.literal("Completed"),
        v.literal("Cancelled")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});