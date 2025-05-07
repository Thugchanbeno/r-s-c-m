import UserSkill from "@/models/UserSkills";
import Skill from "@/models/Skills";
import mongoose from "mongoose";
import { buildBulkWriteOperations } from "./operations";

export const getSkillCounts = async (userId) => {
  const [currentSkillCount, desiredSkillCount] = await Promise.all([
    UserSkill.countDocuments({ userId, isCurrent: true }),
    UserSkill.countDocuments({ userId, isDesired: true }),
  ]);

  return { currentSkillCount, desiredSkillCount };
};

export const getFullSkillData = async (userId) => {
  return UserSkill.find({ userId })
    .populate({
      path: "skillId",
      model: Skill,
      select: "name category",
    })
    .select("-userId -__v")
    .lean();
};

// In controllers.js, update the updateUserSkills function:

export const updateUserSkills = async ({
  userId,
  currentSkills = [],
  desiredSkillIds = [],
  session,
}) => {
  console.log("Updating user skills:", {
    userId,
    currentSkillsCount: currentSkills.length,
    desiredSkillIdsCount: desiredSkillIds.length,
  });

  // Get existing skills
  const existingSkills = await UserSkill.find({ userId })
    .session(session)
    .lean();

  console.log(`Found ${existingSkills.length} existing skills`);

  // Create maps for existing skills
  const existingSkillMap = new Map();
  for (const skill of existingSkills) {
    existingSkillMap.set(skill.skillId.toString(), {
      _id: skill._id,
      isCurrent: skill.isCurrent,
      isDesired: skill.isDesired,
      proficiency: skill.proficiency,
    });
  }

  // Determine what's changing
  const operations = [];

  // Process current skills (only if provided)
  if (currentSkills.length > 0) {
    // Create set of current skill IDs
    const currentSkillIds = new Set(
      currentSkills.map((s) => s.skillId.toString())
    );

    // Map of proficiency by skill ID
    const proficiencyMap = new Map(
      currentSkills.map((s) => [s.skillId.toString(), s.proficiency])
    );

    // Update existing skills that should be current
    for (const skillId of currentSkillIds) {
      const existing = existingSkillMap.get(skillId);
      const proficiency = proficiencyMap.get(skillId);

      if (existing) {
        // Update existing skill
        operations.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              $set: {
                isCurrent: true,
                proficiency,
              },
            },
          },
        });
      } else {
        // Insert new skill
        operations.push({
          insertOne: {
            document: {
              userId,
              skillId: new mongoose.Types.ObjectId(skillId),
              isCurrent: true,
              isDesired: false,
              proficiency,
            },
          },
        });
      }
    }

    // Find skills that should no longer be current
    for (const [skillId, skill] of existingSkillMap.entries()) {
      if (skill.isCurrent && !currentSkillIds.has(skillId)) {
        if (skill.isDesired) {
          // Keep as desired only
          operations.push({
            updateOne: {
              filter: { _id: skill._id },
              update: {
                $set: { isCurrent: false },
                $unset: { proficiency: "" },
              },
            },
          });
        } else {
          // Remove completely
          operations.push({
            deleteOne: { filter: { _id: skill._id } },
          });
        }
      }
    }
  }

  // Process desired skills (only if provided)
  if (desiredSkillIds.length > 0) {
    // Create set of desired skill IDs
    const desiredSkillIdSet = new Set(
      desiredSkillIds.map((id) => id.toString())
    );

    // Update existing skills that should be desired
    for (const skillId of desiredSkillIdSet) {
      const existing = existingSkillMap.get(skillId);

      if (existing) {
        // Update existing skill
        operations.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              $set: { isDesired: true },
            },
          },
        });
      } else {
        // Insert new skill
        operations.push({
          insertOne: {
            document: {
              userId,
              skillId: new mongoose.Types.ObjectId(skillId),
              isCurrent: false,
              isDesired: true,
            },
          },
        });
      }
    }

    // Find skills that should no longer be desired
    for (const [skillId, skill] of existingSkillMap.entries()) {
      if (skill.isDesired && !desiredSkillIdSet.has(skillId)) {
        if (skill.isCurrent) {
          // Keep as current only
          operations.push({
            updateOne: {
              filter: { _id: skill._id },
              update: {
                $set: { isDesired: false },
              },
            },
          });
        } else {
          // Remove completely
          operations.push({
            deleteOne: { filter: { _id: skill._id } },
          });
        }
      }
    }
  }

  // Execute operations if any
  if (operations.length > 0) {
    console.log(`Executing ${operations.length} database operations`);
    const result = await UserSkill.bulkWrite(operations, { session });
    console.log("BulkWrite result:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      insertedCount: result.insertedCount,
      deletedCount: result.deletedCount,
    });
  } else {
    console.log("No operations to execute");
  }

  // Return updated skills
  const updatedSkills = await UserSkill.find({ userId })
    .populate({
      path: "skillId",
      model: Skill,
      select: "name category",
    })
    .select("-userId -__v")
    .session(session)
    .lean();

  console.log(`Returning ${updatedSkills.length} updated skills`);
  return updatedSkills;
};
