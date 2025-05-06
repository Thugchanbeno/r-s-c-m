// /api/userskills/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path if needed
import connectDB from "@/lib/db"; // Adjust path if needed
import UserSkill from "@/models/UserSkills"; // Adjust path if needed
import User from "@/models/User"; // Adjust path if needed
import Skill from "@/models/Skills"; // Adjust path if needed
import mongoose from "mongoose";

// Helper for consistent error responses
const createErrorResponse = (message, status) => {
  console.error("API Error:", message); // Keep server-side error logging
  return NextResponse.json({ success: false, error: message }, { status });
};

/**
 * @desc    Get skills or skill count for the currently authenticated user
 * @route   GET /api/userskills?countOnly=true
 * @access  Private
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return createErrorResponse("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("countOnly") === "true";

  try {
    await connectDB();

    const currentUser = await User.findOne({
      email: session.user.email,
    }).lean();
    if (!currentUser) {
      return createErrorResponse("User not found", 404);
    }
    const userId = currentUser._id;

    if (countOnly) {
      const [currentSkillCount, desiredSkillCount] = await Promise.all([
        UserSkill.countDocuments({ userId, isCurrent: true }),
        UserSkill.countDocuments({ userId, isDesired: true }),
      ]);
      return NextResponse.json({
        success: true,
        currentSkillCount,
        desiredSkillCount,
      });
    } else {
      const userSkills = await UserSkill.find({ userId })
        .populate({
          path: "skillId",
          model: Skill,
          select: "name category",
        })
        .select("-userId -__v") // Exclude userId and version key
        .lean();
      return NextResponse.json({ success: true, data: userSkills });
    }
  } catch (error) {
    console.error("GET /api/userskills Error:", error); // Keep server-side error logging
    return createErrorResponse("Server Error fetching user skills", 500);
  }
}

/**
 * @desc    Update user's current and/or desired skills
 * @route   PUT /api/userskills
 * @access  Private
 */
//theres currently a bug here: user skills are not showing on the fe despite the whole flow for the route working perfectly. need to revisit this put method.
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return createErrorResponse("Unauthorized", 401);
  }

  let mongoSession = null;
  let body;

  try {
    body = await request.json();
  } catch (e) {
    return createErrorResponse("Invalid JSON body provided", 400);
  }

  try {
    await connectDB();

    // --- Input Validation ---
    const { currentSkills, desiredSkillIds } = body;

    // At least one type of skill must be provided for update
    if (!currentSkills && !desiredSkillIds) {
      return createErrorResponse(
        "Request body must contain 'currentSkills' or 'desiredSkillIds'",
        400
      );
    }

    const providedCurrentSkills = Array.isArray(currentSkills)
      ? currentSkills
      : [];
    const providedDesiredSkillIds = Array.isArray(desiredSkillIds)
      ? desiredSkillIds
      : [];

    // Validate structure and proficiency of currentSkills array
    for (const skill of providedCurrentSkills) {
      if (
        typeof skill !== "object" ||
        !skill.skillId ||
        typeof skill.proficiency !== "number" ||
        !mongoose.Types.ObjectId.isValid(skill.skillId)
      ) {
        return createErrorResponse(
          "Invalid format in 'currentSkills'. Expected [{ skillId: string, proficiency: number }]",
          400
        );
      }
      // Validate proficiency range (adjust range if needed)
      if (
        skill.proficiency < 1 ||
        skill.proficiency > 5 ||
        !Number.isInteger(skill.proficiency)
      ) {
        return createErrorResponse(
          "Proficiency must be an integer between 1 and 5",
          400
        );
      }
    }

    // Validate desiredSkillIds array format
    for (const id of providedDesiredSkillIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return createErrorResponse(
          "Invalid format in 'desiredSkillIds'. Expected array of valid ObjectIds",
          400
        );
      }
    }

    // Find user
    const currentUser = await User.findOne({
      email: session.user.email,
    }).lean();
    if (!currentUser) {
      return createErrorResponse("User not found", 404);
    }
    const userId = currentUser._id;

    // --- Skill ID Existence Validation ---
    const currentSkillInputMap = new Map(
      providedCurrentSkills.map((s) => [s.skillId.toString(), s.proficiency])
    );
    const desiredSkillInputSet = new Set(
      providedDesiredSkillIds.map((id) => id.toString())
    );
    const allProvidedSkillIds = [
      ...new Set([...currentSkillInputMap.keys(), ...desiredSkillInputSet]),
    ];

    if (allProvidedSkillIds.length > 0) {
      const validSkills = await Skill.find({
        _id: {
          $in: allProvidedSkillIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      })
        .select("_id")
        .lean();
      const validSkillIdsSet = new Set(
        validSkills.map((s) => s._id.toString())
      );
      const invalidIds = allProvidedSkillIds.filter(
        (id) => !validSkillIdsSet.has(id)
      );

      if (invalidIds.length > 0) {
        return createErrorResponse(
          `Invalid or non-existent Skill IDs provided: ${invalidIds.join(
            ", "
          )}`,
          400
        );
      }
    }

    // --- Transactional Update ---
    mongoSession = await mongoose.startSession();
    let updatedUserSkills = [];

    await mongoSession.withTransaction(async (txSession) => {
      const existingUserSkills = await UserSkill.find({ userId })
        .session(txSession)
        .lean();
      const existingUserSkillsMap = new Map(
        existingUserSkills.map((us) => [us.skillId.toString(), us])
      );

      const operations = [];
      const allRelevantSkillIds = new Set([
        ...allProvidedSkillIds,
        ...existingUserSkills.map((us) => us.skillId.toString()),
      ]);

      // Build bulkWrite operations
      for (const skillIdString of allRelevantSkillIds) {
        if (!mongoose.Types.ObjectId.isValid(skillIdString)) continue; // Should be caught earlier, but double-check

        const existingDoc = existingUserSkillsMap.get(skillIdString);
        const skillObjectId = new mongoose.Types.ObjectId(skillIdString);
        const targetIsCurrent = currentSkillInputMap.has(skillIdString);
        const targetIsDesired = desiredSkillInputSet.has(skillIdString);
        const targetProficiency = targetIsCurrent
          ? currentSkillInputMap.get(skillIdString)
          : null;

        if (!targetIsCurrent && !targetIsDesired) {
          // Action: Delete if exists
          if (existingDoc) {
            operations.push({
              deleteOne: { filter: { _id: existingDoc._id } },
            });
          }
        } else {
          // Action: Insert or Update
          const updatePayload = {
            $set: { isCurrent: targetIsCurrent, isDesired: targetIsDesired },
            $setOnInsert: { userId, skillId: skillObjectId },
          };

          if (targetIsCurrent && targetProficiency !== null) {
            updatePayload.$set.proficiency = targetProficiency;
          } else {
            // Unset proficiency if it's no longer current or was never set
            updatePayload.$unset = { proficiency: "" };
          }

          if (existingDoc) {
            // Update only if necessary
            const needsUpdate =
              existingDoc.isCurrent !== targetIsCurrent ||
              existingDoc.isDesired !== targetIsDesired ||
              (targetIsCurrent &&
                existingDoc.proficiency !== targetProficiency) ||
              (!targetIsCurrent &&
                existingDoc.proficiency !== undefined &&
                existingDoc.proficiency !== null); // Check if proficiency needs removal

            if (needsUpdate) {
              operations.push({
                updateOne: {
                  filter: { _id: existingDoc._id },
                  update: updatePayload,
                },
              });
            }
          } else {
            // Insert new record using upsert for safety
            operations.push({
              updateOne: {
                filter: { userId, skillId: skillObjectId },
                update: updatePayload,
                upsert: true,
              },
            });
          }
        }
      } // End loop

      // Execute bulkWrite if there are operations
      if (operations.length > 0) {
        const bulkResult = await UserSkill.bulkWrite(operations, {
          session: txSession,
        });
        if (bulkResult.hasWriteErrors()) {
          console.error(
            "Bulk write errors occurred:",
            bulkResult.getWriteErrors()
          );
          // Consider throwing an error here to abort the transaction and inform the user
          throw new Error(
            "Failed to update some skills due to database errors."
          );
        }
      }

      // Re-fetch updated skills within the transaction
      updatedUserSkills = await UserSkill.find({ userId })
        .populate({ path: "skillId", model: Skill, select: "name category" })
        .select("-userId -__v")
        .session(txSession)
        .lean();
    }); // End transaction

    return NextResponse.json({ success: true, data: updatedUserSkills });
  } catch (error) {
    console.error(
      `PUT /api/userskills Error for ${session?.user?.email}:`,
      error
    ); // Keep server-side error logging

    // Handle specific error types
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return createErrorResponse(
        `Validation Error: ${messages.join(", ")}`,
        400
      );
    }
    if (error.name === "CastError") {
      return createErrorResponse("Invalid ID format provided", 400);
    }
    if (error.code === 11000) {
      // Duplicate key error
      return createErrorResponse(
        "Duplicate key error - skill may already exist for user",
        409
      );
    }
    // Handle custom errors thrown from transaction
    if (error.message.includes("Failed to update some skills")) {
      return createErrorResponse(error.message, 500);
    }

    // Generic server error
    return createErrorResponse("Server Error updating user skills", 500);
  } finally {
    // Ensure session is always ended
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
}
