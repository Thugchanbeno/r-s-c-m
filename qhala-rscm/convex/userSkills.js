import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

// GET /api/userskills
export const getForCurrentUser = query({
  args: { email: v.string(), countOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const userSkills = await ctx.db
      .query("userSkills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (args.countOnly) {
      const currentSkillCount = userSkills.filter((s) => s.isCurrent).length;
      const desiredSkillCount = userSkills.filter((s) => s.isDesired).length;
      return { currentSkillCount, desiredSkillCount };
    }

    const skills = [];
    for (const us of userSkills) {
      const skill = await ctx.db.get(us.skillId);
      if (skill) {
        skills.push({
          ...us,
          skillName: skill.name,
          category: skill.category,
        });
      }
    }
    return skills;
  },
});

// PUT /api/userskills
export const updateForCurrentUser = mutation({
  args: {
    email: v.string(),
    currentSkills: v.optional(
      v.array(
        v.object({
          skillId: v.id("skills"),
          proficiency: v.number(),
        })
      )
    ),
    desiredSkillIds: v.optional(v.array(v.id("skills"))),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    const existingSkills = await ctx.db
      .query("userSkills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const existingMap = new Map(existingSkills.map((s) => [s.skillId, s]));
    const currentSkillMap = new Map(
      (args.currentSkills || []).map((s) => [s.skillId, s.proficiency])
    );
    const desiredSkillSet = new Set(args.desiredSkillIds || []);

    const allSkillIds = new Set([
      ...existingMap.keys(),
      ...currentSkillMap.keys(),
      ...desiredSkillSet,
    ]);

    for (const skillId of allSkillIds) {
      const existing = existingMap.get(skillId);
      const isCurrent = currentSkillMap.has(skillId);
      const isDesired = desiredSkillSet.has(skillId);
      const proficiency = isCurrent ? currentSkillMap.get(skillId) : undefined;

      if (!isCurrent && !isDesired) {
        if (existing) await ctx.db.delete(existing._id);
        continue;
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          isCurrent,
          isDesired,
          proficiency: isCurrent ? proficiency : undefined,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("userSkills", {
          userId: user._id,
          skillId,
          isCurrent,
          isDesired,
          proficiency: isCurrent ? proficiency : undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    const updated = await ctx.db
      .query("userSkills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const result = [];
    for (const us of updated) {
      const skill = await ctx.db.get(us.skillId);
      if (skill) {
        result.push({
          ...us,
          skillName: skill.name,
          category: skill.category,
        });
      }
    }
    return result;
  },
});