import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { createNotification } from "./notificationUtils";
import { canManageSkill } from "./rbac";

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

// GET /api/skills
export const getAll = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let skills = await ctx.db.query("skills").collect();

    if (args.category) {
      skills = skills.filter(
        (s) => (s.category || "").toLowerCase() === args.category.toLowerCase()
      );
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      skills = skills.filter(
        (sk) =>
          sk.name.toLowerCase().includes(s) ||
          (sk.aliases || []).some((a) => a.toLowerCase().includes(s))
      );
    }
    return skills.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// POST /api/skills
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (!["admin", "hr"].includes(actor.role)) {
      throw new Error("You don't have permission to perform this action.");
    }

    const existing = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) throw new Error(`Skill '${args.name}' already exists.`);

    const now = Date.now();
    const { email, ...skillData } = args;
    return await ctx.db.insert("skills", {
      ...skillData,
      aliases: args.aliases?.map((a) => a.trim().toLowerCase()) || [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// DELETE /api/skills/[skillId]
export const deleteSkill = mutation({
  args: { email: v.string(), skillId: v.id("skills") },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (actor.role !== "admin") {
      throw new Error("You don't have permission to perform this action.");
    }

    const skill = await ctx.db.get(args.skillId);
    if (!skill) throw new Error("Skill not found.");

    const userSkills = await ctx.db
      .query("userSkills")
      .withIndex("by_skill", (q) => q.eq("skillId", args.skillId))
      .collect();

    for (const us of userSkills) {
      await ctx.db.delete(us._id);
    }
    await ctx.db.delete(args.skillId);

    return {
      success: true,
      message: `Skill '${skill.name}' deleted successfully.`,
      userSkillsRemoved: userSkills.length,
    };
  },
});

// GET /api/skills/distribution
export const getDistribution = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (!["admin", "hr"].includes(actor.role)) {
      throw new Error("You don't have permission to perform this action.");
    }

    const allSkills = await ctx.db.query("skills").collect();
    if (allSkills.length === 0) return [];

    const userSkills = await ctx.db.query("userSkills").collect();

    const skillCounts = {};
    for (const us of userSkills) {
      const sid = us.skillId;
      if (!skillCounts[sid]) {
        skillCounts[sid] = { currentUserCount: 0, desiredUserCount: 0 };
      }
      if (us.isCurrent) skillCounts[sid].currentUserCount++;
      if (us.isDesired) skillCounts[sid].desiredUserCount++;
    }

    const categorized = {};
    for (const skill of allSkills) {
      const category = skill.category || "Uncategorized";
      if (!categorized[category]) {
        categorized[category] = { category, skills: [] };
      }
      const counts = skillCounts[skill._id] || {
        currentUserCount: 0,
        desiredUserCount: 0,
      };
      categorized[category].skills.push({
        skillId: skill._id,
        name: skill.name,
        description: skill.description,
        currentUserCount: counts.currentUserCount,
        desiredUserCount: counts.desiredUserCount,
      });
    }

    return Object.values(categorized);
  },
});

// AI skill suggestions
export const getSuggestions = mutation({
  args: { email: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    await getActor(ctx, args.email); // any logged-in user

    try {
      const suggestions = [
        { name: "JavaScript", category: "Programming", confidence: 0.95 },
        { name: "React", category: "Frontend", confidence: 0.87 },
        { name: "Node.js", category: "Backend", confidence: 0.82 },
      ];
      return { success: true, suggestions };
    } catch (error) {
      throw new Error(
        "Unable to get skill suggestions. Please try again later."
      );
    }
  },
});

// Verify user skill
export const verifyUserSkill = mutation({
  args: {
    email: v.string(),
    userSkillId: v.id("userSkills"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const userSkill = await ctx.db.get(args.userSkillId);
    if (!userSkill) throw new Error("User skill not found.");

    const targetUser = await ctx.db.get(userSkill.userId);
    if (!targetUser) throw new Error("Target user not found.");

    if (
      actor.role !== "line_manager" ||
      targetUser.lineManagerId !== actor._id
    ) {
      if (!["admin", "hr"].includes(actor.role)) {
        throw new Error(
          "Only the user's line manager, HR, or Admin can verify skills."
        );
      }
    }

    const now = Date.now();
    let updatedProofDocs = userSkill.proofDocuments || [];
    updatedProofDocs = updatedProofDocs.map((doc) => ({
      ...doc,
      verificationStatus: args.action === "approve" ? "approved" : "rejected",
      verifiedBy: actor._id,
      verifiedAt: now,
      rejectionReason: args.action === "reject" ? args.reason : undefined,
    }));

    await ctx.db.patch(args.userSkillId, {
      proofDocuments: updatedProofDocs,
      updatedAt: now,
    });

    const skill = await ctx.db.get(userSkill.skillId);
    const notificationType = args.action === "approve" ? "skill_verification_approved" : "skill_verification_rejected";
    
    await createNotification(ctx, {
      userId: userSkill.userId,
      type: notificationType,
      title: `Skill Verification ${args.action === "approve" ? "Approved" : "Rejected"}`,
      message: `Your skill "${skill?.name}" has been ${args.action}d by ${actor.name}`,
      link: `/skills/profile`,
      actionUrl: args.action === "reject" ? `/skills/profile` : undefined,
      requiresAction: args.action === "reject",
      relatedResourceId: args.userSkillId,
      relatedResourceType: "userSkill",
      actionUserId: actor._id,
      actionUserRole: actor.role,
      contextData: {
        skillName: skill?.name,
        skillCategory: skill?.category,
        verifierName: actor.name,
        reason: args.reason,
        verificationAction: args.action,
        actionUserName: actor.name,
        actionUserAvatar: actor.avatarUrl,
      },
    });

    return { success: true, message: `Skill ${args.action}d successfully.` };
  },
});

// Pending verifications
export const getPendingVerifications = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (!["line_manager", "admin", "hr"].includes(actor.role)) {
      throw new Error(
        "Only Line Managers, HR, or Admin can view pending verifications."
      );
    }

    let userSkills = await ctx.db.query("userSkills").collect();
    userSkills = userSkills.filter(
      (us) =>
        us.proofDocuments &&
        us.proofDocuments.some((doc) => doc.verificationStatus === "pending")
    );

    if (actor.role === "line_manager") {
      const directReports = await ctx.db
        .query("users")
        .withIndex("by_line_manager", (q) => q.eq("lineManagerId", actor._id))
        .collect();
      const directReportIds = new Set(directReports.map((u) => u._id));
      userSkills = userSkills.filter((us) => directReportIds.has(us.userId));
    }

    const enriched = [];
    for (const us of userSkills) {
      const user = await ctx.db.get(us.userId);
      const skill = await ctx.db.get(us.skillId);
      enriched.push({
        ...us,
        userName: user?.name,
        userEmail: user?.email,
        userAvatarUrl: user?.avatarUrl,
        skillName: skill?.name,
        skillCategory: skill?.category,
      });
    }

    return enriched;
  },
});

// Upload proof document
export const uploadProofDocument = mutation({
  args: {
    email: v.string(),
    userSkillId: v.id("userSkills"),
    fileName: v.string(),
    proofType: v.union(
      v.literal("cv"),
      v.literal("certification"),
      v.literal("badge"),
      v.literal("document"),
      v.literal("portfolio"),
      v.literal("link")
    ),
    issuer: v.optional(v.string()),
    documentStorageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const userSkill = await ctx.db.get(args.userSkillId);
    if (!userSkill) throw new Error("User skill not found.");
    if (userSkill.userId !== actor._id) {
      throw new Error("You can only upload proof for your own skills.");
    }
    if (!args.documentStorageId && !args.url) {
      throw new Error("Either a file or a link must be provided as proof.");
    }

    const now = Date.now();
    const newProofDoc = {
      documentStorageId: args.documentStorageId,
      url: args.url,
      fileName: args.fileName,
      proofType: args.proofType,
      issuer: args.issuer,
      verificationStatus: "pending",
      uploadedAt: now,
    };

    const updatedProofs = [...(userSkill.proofDocuments || []), newProofDoc];
    await ctx.db.patch(args.userSkillId, {
      proofDocuments: updatedProofs,
      updatedAt: now,
    });

    const user = await ctx.db.get(userSkill.userId);
    if (user?.lineManagerId) {
      const skill = await ctx.db.get(userSkill.skillId);
      
      await createNotification(ctx, {
        userId: user.lineManagerId,
        type: "skill_verification_requested",
        title: "Skill Verification Request",
        message: `${user.name} uploaded proof for skill "${skill?.name}" - pending your verification`,
        link: `/skills/verifications`,
        actionUrl: `/skills/verifications`,
        requiresAction: true,
        expiresAt: now + (7 * 24 * 60 * 60 * 1000), // Expire in 7 days
        relatedResourceId: args.userSkillId,
        relatedResourceType: "userSkill",
        actionUserId: user._id,
        actionUserRole: user.role,
        contextData: {
          skillName: skill?.name,
          skillCategory: skill?.category,
          userName: user.name,
          proofType: args.proofType,
          fileName: args.fileName,
          actionUserName: user.name,
          actionUserAvatar: user.avatarUrl,
        },
      });
    }

    return { success: true, message: "Proof document uploaded successfully." };
  },
});

// Remove proof document
export const removeProofDocument = mutation({
  args: {
    email: v.string(),
    userSkillId: v.id("userSkills"),
    documentStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const userSkill = await ctx.db.get(args.userSkillId);
    if (!userSkill) throw new Error("User skill not found.");
    if (userSkill.userId !== actor._id) {
      throw new Error("You can only remove proof for your own skills.");
    }

    const updatedProofs = (userSkill.proofDocuments || []).filter(
      (doc) => doc.documentStorageId !== args.documentStorageId
    );

    await ctx.db.patch(args.userSkillId, {
      proofDocuments: updatedProofs,
      updatedAt: Date.now(),
    });

    await ctx.storage.delete(args.documentStorageId);

    return { success: true, message: "Proof document removed successfully." };
  },
});

// Analytics
export const getSkillAnalytics = query({
  args: {
    email: v.string(),
    skillId: v.optional(v.id("skills")),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["admin", "hr", "pm", "line_manager"]);

    let userSkills = await ctx.db.query("userSkills").collect();
    if (args.skillId) {
      userSkills = userSkills.filter((us) => us.skillId === args.skillId);
    }
    if (args.category) {
      const skillsInCategory = await ctx.db
        .query("skills")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
      const skillIds = new Set(skillsInCategory.map((s) => s._id));
      userSkills = userSkills.filter((us) => skillIds.has(us.skillId));
    }

    const analytics = {
      totalSkillInstances: userSkills.length,
      currentSkills: userSkills.filter((us) => us.isCurrent).length,
      desiredSkills: userSkills.filter((us) => us.isDesired).length,
      verifiedSkills: userSkills.filter(
        (us) =>
          us.proofDocuments &&
          us.proofDocuments.some((doc) => doc.verificationStatus === "approved")
      ).length,
      pendingVerification: userSkills.filter(
        (us) =>
          us.proofDocuments &&
          us.proofDocuments.some((doc) => doc.verificationStatus === "pending")
      ).length,
      proficiencyDistribution: {},
    };

    userSkills.forEach((us) => {
      if (us.proficiency) {
        const level = `Level ${us.proficiency}`;
        analytics.proficiencyDistribution[level] =
          (analytics.proficiencyDistribution[level] || 0) + 1;
      }
    });

    return analytics;
  },
});
