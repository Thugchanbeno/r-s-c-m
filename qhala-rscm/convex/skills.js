// convex/skills.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("skills", {
      ...args,
      aliases: args.aliases?.map((a) => a.trim().toLowerCase()) || [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getAll = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("skills");
    if (args.category) {
      query = query.withIndex("by_category", (q) =>
        q.eq("category", args.category)
      );
    }
    const skills = await query.collect();

    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      return skills.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm) ||
          s.aliases?.some((alias) => alias.includes(searchTerm))
      );
    }
    return skills;
  },
});

export const getById = query({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("skills"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    if (updateData.aliases) {
      updateData.aliases = updateData.aliases.map((a) =>
        a.trim().toLowerCase()
      );
    }
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});