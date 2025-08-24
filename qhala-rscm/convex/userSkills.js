// convex/userSkills.js
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a user skill
export const create = mutation({
  args: {
    userId: v.id("users"),
    skillId: v.id("skills"),
    proficiency: v.optional(v.number()),
    interestLevel: v.optional(v.number()),
    isCurrent: v.boolean(),
    isDesired: v.boolean(),
    proofDocuments: v.optional(
      v.array(
        v.object({
          documentStorageId: v.id("_storage"),
          fileName: v.string(),
          proofType: v.union(
            v.literal("certification"),
            v.literal("badge"),
            v.literal("document")
          ),
          issuer: v.optional(v.string()),
          verificationStatus: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected")
          ),
          verifiedBy: v.optional(v.id("users")),
          verifiedAt: v.optional(v.number()),
          rejectionReason: v.optional(v.string()),
          uploadedAt: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("userSkills", {
      ...args,
      proofDocuments: args.proofDocuments || [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all skills for a user
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSkills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Add a proof document to a user skill
export const addProofDocument = mutation({
  args: {
    userSkillId: v.id("userSkills"),
    documentStorageId: v.id("_storage"),
    fileName: v.string(),
    proofType: v.union(
      v.literal("certification"),
      v.literal("badge"),
      v.literal("document")
    ),
    issuer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userSkill = await ctx.db.get(args.userSkillId);
    if (!userSkill) throw new Error("User skill not found");

    const newProof = {
      documentStorageId: args.documentStorageId,
      fileName: args.fileName,
      proofType: args.proofType,
      issuer: args.issuer,
      verificationStatus: "pending",
      uploadedAt: Date.now(),
    };

    const updatedProofs = [...(userSkill.proofDocuments || []), newProof];

    await ctx.db.patch(args.userSkillId, {
      proofDocuments: updatedProofs,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Verify a proof document
export const verifyProof = mutation({
  args: {
    userSkillId: v.id("userSkills"),
    documentIndex: v.number(),
    approved: v.boolean(),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userSkill = await ctx.db.get(args.userSkillId);
    if (!userSkill) throw new Error("User skill not found");

    const proofs = [...(userSkill.proofDocuments || [])];
    if (args.documentIndex >= proofs.length) {
      throw new Error("Invalid proof index");
    }

    proofs[args.documentIndex] = {
      ...proofs[args.documentIndex],
      verificationStatus: args.approved ? "approved" : "rejected",
      verifiedBy: "system", // replace with actual userId from session
      verifiedAt: Date.now(),
      rejectionReason: args.rejectionReason,
    };

    await ctx.db.patch(args.userSkillId, {
      proofDocuments: proofs,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("userSkills").collect();
  },
});