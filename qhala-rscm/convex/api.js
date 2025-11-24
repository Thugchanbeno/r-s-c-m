import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

//  Vector Search Action
export const searchSkills = action({
  args: { embedding: v.array(v.float64()), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.vectorSearch("skills", "by_embedding", {
      vector: args.embedding,
      limit: args.limit,
    });
  },
});

//  Core Queries for Recommender
export const getProjectAndCandidates = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const users = await ctx.db
      .query("users")
      .withIndex("by_availability", (q) =>
        q.eq("availabilityStatus", "available")
      )
      .collect();

    const candidates = await Promise.all(
      users.map(async (user) => {
        const [skills, allocations] = await Promise.all([
          ctx.db
            .query("userSkills")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect(),
          ctx.db
            .query("allocations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect(),
        ]);
        return { ...user, skills, allocations };
      })
    );
    return { project, candidates };
  },
});

// Submit Feedback to Python (which then updates weights + writes to DB)
export const submitFeedback = action({
  args: {
    userId: v.string(),
    projectId: v.string(),
    recommendationType: v.string(),
    rating: v.number(), // 1 or 0
    comments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.NLP_API_URL_LOCAL;
    if (!nlpServiceUrl) {
      throw new Error("NLP_API_URL_LOCAL not set");
    }

    // Call Python
    const response = await fetch(`${nlpServiceUrl}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: args.userId,
        projectId: args.projectId,
        recommendationType: args.recommendationType,
        rating: args.rating === 1, // Python expects boolean for 'rating' (True/False)
        comments: args.comments,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Python service error: ${text}`);
    }

    return await response.json();
  },
});

//  Helper Queries & Mutations
export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActiveProjects = query({
  handler: async (ctx) =>
    await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("status"), "Active"))
      .collect(),
});

export const getAllSkills = query({
  handler: async (ctx) => await ctx.db.query("skills").collect(),
});

export const getUserSkills = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("userSkills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect(),
});

export const getProjectsNeedingSkills = query({
  args: { statusFilter: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("projects").collect();
    if (args.statusFilter && args.statusFilter.length > 0) {
      const filter = args.statusFilter;
      projects = projects.filter((p) => filter.includes(p.status));
    }
    return projects.filter(
      (p) => !p.requiredSkills || p.requiredSkills.length === 0
    );
  },
});

export const updateProjectSkills = mutation({
  args: {
    id: v.id("projects"),
    requiredSkills: v.array(v.any()),
    nlpExtractedSkills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      requiredSkills: args.requiredSkills,
      nlpExtractedSkills: args.nlpExtractedSkills,
    });
  },
});

export const updateSkillEmbedding = mutation({
  args: { id: v.id("skills"), embedding: v.array(v.float64()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { embedding: args.embedding });
  },
});

export const logFeedback = mutation({
  args: {
    userId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    recommendationType: v.optional(v.string()),
    feedbackType: v.optional(v.string()),
    type: v.optional(v.string()),

    rating: v.number(),
    comments: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const cleanArgs = {
      userId: args.userId,
      projectId: args.projectId,
      rating: args.rating,
      comments: args.comments,
      timestamp: args.timestamp,
      recommendationType:
        args.recommendationType || args.feedbackType || args.type || "user",
    };

    await ctx.db.insert("recommendationFeedback", cleanArgs);
  },
});

export const getRecentFeedback = query({
  handler: async (ctx) =>
    await ctx.db.query("recommendationFeedback").order("desc").take(500),
});

export const getRecentProjects = query({
  args: { cutoffTime: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .order("desc")
      .filter((q) => q.gte(q.field("createdAt"), args.cutoffTime))
      .collect();
  },
});
