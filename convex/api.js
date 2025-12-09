import { action, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// convex/api.js

// ... imports

export const getUserInternal = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    // 1. Get Skills
    const userSkills = await ctx.db
      .query("userSkills")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();

    const skillNames = await Promise.all(
      userSkills.map(async (us) => {
        const skill = await ctx.db.get(us.skillId);
        return skill ? skill.name : null;
      })
    );

    const legacySkills =
      user.extractedSkills?.map((s) => (typeof s === "string" ? s : s.name)) ||
      [];
    const allSkills = [
      ...new Set([...legacySkills, ...skillNames.filter(Boolean)]),
    ];

    // 2. Get Allocations & POPULATE Project Data (Robust Fix)
    const rawAllocations = await ctx.db
      .query("allocations")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const populatedAllocations = await Promise.all(
      rawAllocations.map(async (a) => {
        // Handle case where projectId might be missing
        if (!a.projectId)
          return { ...a, projectId: { name: "Unknown Project" } };

        const project = await ctx.db.get(a.projectId);

        // Fallback logic for legacy data
        const safeName = project
          ? project.name || project.title || "Untitled Project"
          : "Deleted Project";

        return {
          ...a,
          // We replace the ID string with an Object containing the name
          projectId: { _id: a.projectId, name: safeName },
        };
      })
    );

    return {
      ...user,
      allocations: populatedAllocations,
      skills: allSkills,
      extractedSkills: allSkills,
    };
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

        // Attach score for UI ranking
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

export const createProjectAction = action({
  args: {
    title: v.string(),
    description: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.string()),
    email: v.string(),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nlpServiceUrl = process.env.API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");
    const response = await fetch(`${nlpServiceUrl}/projects/create`, {
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
      const text = await response.text();
      throw new Error(`Python Error: ${text}`);
    }

    return await response.json();
  },
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

export const refreshUserEmbedding = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // 1. Fetch User Data
    const user = await ctx.runQuery(internal.api.getUserInternal, {
      id: args.userId,
    });
    if (!user) return;

    // 2. Prepare Context
    const skillsList = user.extractedSkills || [];
    let skillNames = "";
    if (skillsList.length > 0) {
      skillNames = skillsList
        .map((s) => {
          if (typeof s === "string") return s;
          if (s.name) return s.name;
          return "";
        })
        .filter(Boolean)
        .join(", ");
    }

    const profileContext = `Role: ${user.role}. Bio: ${user.bio || ""}. Skills: ${skillNames}`;

    // 3. Call Python
    const nlpServiceUrl = process.env.API_URL;
    if (!nlpServiceUrl) throw new Error("API_URL not set");

    const response = await fetch(`${nlpServiceUrl}/users/embed-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: profileContext }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Python Embedding Error: ${text}`);
    }

    const { embedding } = await response.json();

    // 4. Save Vector (Calls Domain Mutation in users.js)
    await ctx.runMutation(api.users.updateEmbedding, {
      userId: args.userId,
      embedding,
    });

    return { success: true };
  },
});
