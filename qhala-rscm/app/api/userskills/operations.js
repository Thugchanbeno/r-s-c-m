import mongoose from "mongoose";

export const buildBulkWriteOperations = ({
  userId,
  currentSkillMap,
  desiredSkillSet,
  existingSkills,
}) => {
  const operations = [];
  const existingMap = new Map(
    existingSkills.map((skill) => [skill.skillId.toString(), skill])
  );

  // Get all skill IDs to process
  const allSkillIds = new Set([
    ...currentSkillMap.keys(),
    ...desiredSkillSet,
    ...existingSkills.map((skill) => skill.skillId.toString()),
  ]);

  console.log("Processing skills:", {
    existingCount: existingSkills.length,
    currentCount: currentSkillMap.size,
    desiredCount: desiredSkillSet.size,
    totalToProcess: allSkillIds.size,
  });

  // Process all skills
  for (const skillId of allSkillIds) {
    const existing = existingMap.get(skillId);
    const isCurrent = currentSkillMap.has(skillId);
    const isDesired = desiredSkillSet.has(skillId);

    console.log(`Processing skill ${skillId}:`, {
      exists: !!existing,
      isCurrent,
      isDesired,
    });

    // If neither current nor desired, delete if exists
    if (!isCurrent && !isDesired) {
      if (existing) {
        operations.push({
          deleteOne: { filter: { _id: existing._id } },
        });
        console.log(`Deleting skill ${skillId}`);
      }
      continue;
    }

    // Get proficiency if it's a current skill
    const proficiency = isCurrent ? currentSkillMap.get(skillId) : null;

    // Build update operation
    const updateDoc = {
      $set: {
        isCurrent,
        isDesired,
      },
    };

    // Handle proficiency field
    if (isCurrent && proficiency !== null) {
      updateDoc.$set.proficiency = proficiency;
    } else if (!isCurrent) {
      // Only unset proficiency if not a current skill
      updateDoc.$unset = { proficiency: "" };
    }

    // Add setOnInsert for new documents
    if (!existing) {
      updateDoc.$setOnInsert = {
        userId,
        skillId: new mongoose.Types.ObjectId(skillId),
      };
    }

    // Create operation
    if (existing) {
      operations.push({
        updateOne: {
          filter: { _id: existing._id },
          update: updateDoc,
        },
      });
      console.log(`Updating skill ${skillId}`);
    } else {
      operations.push({
        updateOne: {
          filter: {
            userId,
            skillId: new mongoose.Types.ObjectId(skillId),
          },
          update: updateDoc,
          upsert: true,
        },
      });
      console.log(`Inserting skill ${skillId}`);
    }
  }

  console.log(`Generated ${operations.length} operations`);
  return operations;
};
