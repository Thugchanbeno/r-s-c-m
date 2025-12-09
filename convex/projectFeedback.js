import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

export const create = mutation({
  args: {
    email: v.string(),
    projectId: v.id("projects"),
    userId: v.id("users"),
    feedbackType: v.union(
      v.literal("performance"),
      v.literal("process"),
      v.literal("resources"),
      v.literal("skills"),
      v.literal("general")
    ),
    overallRating: v.optional(v.number()),
    communicationRating: v.optional(v.number()),
    technicalRating: v.optional(v.number()),
    timelinessRating: v.optional(v.number()),
    whatWentWell: v.optional(v.string()),
    whatCouldImprove: v.optional(v.string()),
    resourcesNeeded: v.optional(v.string()),
    skillsToFocus: v.optional(v.array(v.id("skills"))),
    isAnonymous: v.boolean(),
    visibleToRoles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");

    const allocation = await ctx.db
      .query("allocations")
      .withIndex("by_user", (q) => q.eq("userId", actor._id))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first();

    const isProjectMember = allocation || project.pmId === actor._id || ["admin", "hr"].includes(actor.role);
    
    if (!isProjectMember) {
      throw new Error("You can only provide feedback for projects you've worked on.");
    }

    const now = Date.now();
    const { email, ...feedbackData } = args;
    
    return await ctx.db.insert("projectFeedback", {
      ...feedbackData,
      submittedByUserId: actor._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getByProject = query({
  args: { 
    email: v.string(),
    projectId: v.id("projects"),
    feedbackType: v.optional(v.string()),
    includeAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");

    const canView = 
      project.pmId === actor._id ||
      ["admin", "hr"].includes(actor.role);

    if (!canView) {
      throw new Error("You don't have permission to view this project's feedback.");
    }

    let feedback = await ctx.db
      .query("projectFeedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (args.feedbackType) {
      feedback = feedback.filter(f => f.feedbackType === args.feedbackType);
    }

    feedback = feedback.filter(f => 
      f.visibleToRoles.includes(actor.role) || 
      ["admin", "hr"].includes(actor.role)
    );

    const enrichedFeedback = [];
    for (const fb of feedback) {
      const targetUser = await ctx.db.get(fb.userId);
      const submittedByUser = fb.isAnonymous ? null : await ctx.db.get(fb.submittedByUserId);

      enrichedFeedback.push({
        ...fb,
        targetUserName: targetUser?.name,
        submittedByUserName: submittedByUser?.name || (fb.isAnonymous ? "Anonymous" : "Unknown"),
      });
    }

    return enrichedFeedback;
  },
});

export const getProjectAnalytics = query({
  args: { 
    email: v.string(),
    projectId: v.id("projects") 
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["pm", "hr", "admin"]);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");

    const feedback = await ctx.db
      .query("projectFeedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const ratings = {
      overall: [],
      communication: [],
      technical: [],
      timeliness: [],
    };

    feedback.forEach(fb => {
      if (fb.overallRating) ratings.overall.push(fb.overallRating);
      if (fb.communicationRating) ratings.communication.push(fb.communicationRating);
      if (fb.technicalRating) ratings.technical.push(fb.technicalRating);
      if (fb.timelinessRating) ratings.timeliness.push(fb.timelinessRating);
    });

    const averages = {};
    Object.keys(ratings).forEach(key => {
      const values = ratings[key];
      averages[key] = values.length > 0 ? 
        Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : 0;
    });

    const feedbackByType = {};
    feedback.forEach(fb => {
      feedbackByType[fb.feedbackType] = (feedbackByType[fb.feedbackType] || 0) + 1;
    });

    return {
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
      },
      totalFeedback: feedback.length,
      averageRatings: averages,
      feedbackByType,
      anonymousFeedback: feedback.filter(f => f.isAnonymous).length,
    };
  },
});