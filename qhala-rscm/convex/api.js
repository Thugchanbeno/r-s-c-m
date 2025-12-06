import { query, mutation, action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getUserInternal = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return { ...user, allocations };
  },
});

export const searchUsers = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("users", "by_embedding", {
      vector: args.embedding,
      limit: args.limit * 2,
    });

    const users = await Promise.all(
      results.map(async (result) => {
        const user = await ctx.runQuery(internal.api.getUserInternal, {
          id: result._id,
        });
        if (!user) return null;
        if (user.availabilityStatus !== "available") return null;

        return { ...user, _score: result._score };
      })
    );

    return users.filter((u) => u !== null).slice(0, args.limit);
  },
});

export const searchSkills = action({
  args: { embedding: v.array(v.float64()), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.vectorSearch("skills", "by_embedding", {
      vector: args.embedding,
      limit: args.limit,
    });
  },
});

export const saveUserFromCV = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    bio: v.string(),
    skills: v.array(v.any()),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bio: args.bio,
        extractedSkills: args.skills,
        embedding: args.embedding,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        bio: args.bio,
        extractedSkills: args.skills,
        embedding: args.embedding,
        role: "employee",
        authProviderId: "pending_invite",
        availabilityStatus: "available",
        weeklyHours: 40,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const updateUserSkillsFromCV = mutation({
  args: {
    userId: v.id("users"),
    skills: v.array(v.any()),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      extractedSkills: args.skills,
      embedding: args.embedding,
      updatedAt: Date.now(),
    });
  },
});

export const saveProjectAnalysis = mutation({
  args: {
    id: v.id("projects"),
    embedding: v.array(v.float64()),
    requiredSkills: v.array(v.any()),
    nlpExtractedSkills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const resolvedSkills = await Promise.all(
      args.requiredSkills.map(async (skill) => {
        const name = skill.skillName.trim();
        let existingSkill = await ctx.db
          .query("skills")
          .withIndex("by_name", (q) => q.eq("name", name))
          .first();

        let skillId;
        if (existingSkill) {
          skillId = existingSkill._id;
        } else {
          skillId = await ctx.db.insert("skills", {
            name: name,
            category: skill.category || "Uncategorized",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        return {
          skillId: skillId,
          skillName: name,
          proficiencyLevel: skill.proficiencyLevel || 1,
          category: skill.category,
          isRequired: true,
        };
      })
    );

    await ctx.db.patch(args.id, {
      embedding: args.embedding,
      requiredSkills: resolvedSkills,
      nlpExtractedSkills: args.nlpExtractedSkills,
    });
  },
});

export const logFeedback = mutation({
  args: {
    userId: v.string(),
    projectId: v.string(),
    recommendationType: v.string(),
    rating: v.number(),
    comments: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("recommendationFeedback", args);
  },
});

export const updateSkillEmbedding = mutation({
  args: {
    skillId: v.id("skills"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.skillId, {
      embedding: args.embedding,
      updatedAt: Date.now(),
    });
  },
});

export const saveSkill = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) throw new Error("Skill already exists");

    await ctx.db.insert("skills", {
      name: args.name,
      category: args.category,
      description: args.description || "",
      aliases: args.aliases || [],
      embedding: args.embedding,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const debugGetAllUsers = query({
  handler: async (ctx) => await ctx.db.query("users").collect(),
});

export const finalizeOnboarding = action({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
    bio: v.string(),
    skills: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/onboard/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${await response.text()}`);
    }
    return await response.json();
  },
});

export const searchTalent = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/search/talent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: args.query }),
    });

    if (!response.ok) throw new Error("Failed to search talent pool");
    return await response.json();
  },
});

export const analyzeProjectText = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/nlp/analyze-project-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: args.text }),
    });

    if (!response.ok) throw new Error("Analysis failed");
    return await response.json();
  },
});

export const createSkill = action({
  args: {
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/skills/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Python Error: ${text}`);
    }

    return await response.json();
  },
});

export const generateSkillEmbeddings = action({
  args: { skills: v.array(v.string()) },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/skills/embed-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: args.skills }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  },
});
