import { query, mutation, action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getUserInternal = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    // Fetch allocations for Python's availability math
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
    //  Vector Search
    const results = await ctx.vectorSearch("users", "by_embedding", {
      vector: args.embedding,
      limit: args.limit * 2, // Fetch extra for filtering
    });

    //  Hydrate & Filter Availability
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

// Admin/HR uploads CV to create user
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
      // Update existing user profile with extracted data
      await ctx.db.patch(existing._id, {
        bio: args.bio,
        extractedSkills: args.skills, // Store AI skills separately
        embedding: args.embedding,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        bio: args.bio,
        extractedSkills: args.skills,
        embedding: args.embedding,
        // Default fields required by schema
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

// Existing User updates their own skills via CV
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

// Save Project Analysis (Wizard Completion)
export const saveProjectAnalysis = mutation({
  args: {
    id: v.id("projects"),
    embedding: v.array(v.float64()),
    requiredSkills: v.array(v.any()), // Names + Proficiency
    nlpExtractedSkills: v.array(v.string()), // Just Names
  },
  handler: async (ctx, args) => {
    // Resolve Skill Names to IDs
    const resolvedSkills = await Promise.all(
      args.requiredSkills.map(async (skill) => {
        const name = skill.skillName.trim();

        // Check exist
        let existingSkill = await ctx.db
          .query("skills")
          .withIndex("by_name", (q) => q.eq("name", name))
          .first();

        let skillId;
        if (existingSkill) {
          skillId = existingSkill._id;
        } else {
          // Create missing skill
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

// Feedback Logging
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

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const finalizeOnboarding = action({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
    bio: v.string(),
    skills: v.array(
      v.object({
        name: v.string(),
        level: v.string(),
        proficiencyLevel: v.float64(),
        years: v.optional(v.float64()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/onboard/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Python service error: ${text}`);
    }

    return await response.json();
  },
});

export const searchTalent = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/search/talent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: args.query }),
    });

    if (!response.ok) {
      throw new Error("Failed to search talent pool");
    }

    return await response.json();
  },
});

export const analyzeProjectText = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/nlp/analyze-project-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: args.text }),
    });

    if (!response.ok) {
      throw new Error("Analysis failed");
    }

    return await response.json();
  },
});
