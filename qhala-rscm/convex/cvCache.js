// convex/cvCache.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    fileName: v.string(),
    rawText: v.string(),
    extractedSkills: v.array(v.object({
      id: v.optional(v.string()),
      name: v.string(),
      category: v.optional(v.string()),
      similarity: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cvCache", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getAll = query({
  args: {
    skillName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cvs = await ctx.db
      .query("cvCache")
      .withIndex("by_created_at", (q) => q)
      .collect();
    
    let filtered = cvs;
    
    if (args.skillName) {
      const skillRegex = new RegExp(args.skillName, 'i');
      filtered = cvs.filter(cv => 
        cv.extractedSkills.some(skill => skillRegex.test(skill.name))
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }
    
    return filtered;
  },
});