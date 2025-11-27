import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";

function requireRole(user, allowed) {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("You don't have permission to perform this action.");
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

export const getAll = query({
  args: {
    email: v.string(),
    skill: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["hr", "admin", "pm"]);

    let cvs = await ctx.db.query("cvCache").collect();

    if (args.skill) {
      const regex = args.skill.toLowerCase();
      cvs = cvs.filter((cv) =>
        cv.extractedSkills.some((s) => s.name.toLowerCase().includes(regex))
      );
    }

    cvs.sort((a, b) => b.createdAt - a.createdAt);

    return cvs.slice(0, 50);
  },
});

export const uploadCV = mutation({
  args: {
    email: v.string(),
    fileStorageId: v.id("_storage"),
    fileName: v.string(),
    rawText: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["hr", "admin", "pm"]);

    const now = Date.now();
    const cvId = await ctx.db.insert("cvCache", {
      fileName: args.fileName,
      rawText: args.rawText,
      extractedEntities: null,
      extractedSkills: [],
      prepopulatedData: null,
      fileStorageId: args.fileStorageId,
      createdAt: now,
    });

    return { success: true, id: cvId };
  },
});

export const extractEntities = action({
  args: {
    email: v.string(),
    text: v.string(),
    fileName: v.optional(v.string()),
    cacheResult: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["pm", "hr", "admin"]);

    if (!args.text || args.text.trim() === "") {
      throw new Error("Text is required and must be a non-empty string.");
    }

    const nlpServiceUrl = `${
      process.env.NLP_API_URL_LOCAL || "http://localhost:8000"
    }/nlp/extract-entities`;

    try {
      const nlpResponse = await fetch(nlpServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: args.text }),
      });

      const nlpResult = await nlpResponse.json();

      if (!nlpResponse.ok) {
        throw new Error(
          nlpResult.detail || nlpResult.error || "NLP service request failed"
        );
      }

      if (args.cacheResult && args.fileName) {
        const now = Date.now();
        await ctx.db.insert("cvCache", {
          fileName: args.fileName,
          rawText: args.text,
          extractedEntities: nlpResult,
          extractedSkills: nlpResult.skills || [],
          prepopulatedData: {
            name: nlpResult.personal_info?.name || null,
            email: nlpResult.personal_info?.email || null,
            phone: nlpResult.personal_info?.phone || null,
            skills: nlpResult.skills || [],
            experience: nlpResult.experience || [],
            education: nlpResult.education || [],
          },
          createdAt: now,
        });
      }

      return { success: true, data: nlpResult };
    } catch (error) {
      console.error("NLP extraction error:", error.message);
      throw new Error("Failed to extract entities from CV");
    }
  },
});

export const linkToUser = mutation({
  args: {
    email: v.string(),
    cvId: v.id("cvCache"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await getActor(ctx, args.email);

    const cv = await ctx.db.get(args.cvId);
    if (!cv) throw new Error("CV not found");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();

    for (const skill of cv.extractedSkills) {
      const existingSkill = await ctx.db
        .query("skills")
        .withIndex("by_name", (ix) => ix.eq("name", skill.name))
        .first();

      let skillId;
      if (existingSkill) {
        skillId = existingSkill._id;
      } else {
        skillId = await ctx.db.insert("skills", {
          name: skill.name,
          category: skill.category || "Uncategorized",
          createdAt: now,
          updatedAt: now,
        });
      }

      const existingUserSkill = await ctx.db
        .query("userSkills")
        .withIndex("by_user_skill", (ix) =>
          ix.eq("userId", args.userId).eq("skillId", skillId)
        )
        .first();

      if (!existingUserSkill) {
        await ctx.db.insert("userSkills", {
          userId: args.userId,
          skillId,
          isCurrent: true,
          isDesired: false,
          proficiency: 1,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true, message: "Skills linked to user successfully" };
  },
});
