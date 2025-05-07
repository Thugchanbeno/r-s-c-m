import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

import { createErrorResponse } from "./utils";
import { validateCurrentSkills, validateDesiredSkills } from "./validators";
import {
  getSkillCounts,
  getFullSkillData,
  updateUserSkills,
} from "./controllers";

/**
 * @desc    Get skills or skill count for the currently authenticated user
 * @route   GET /api/userskills?countOnly=true
 * @access  Private
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return createErrorResponse("Unauthorized", 401);
  }

  try {
    await connectDB();

    const currentUser = await User.findOne({
      email: session.user.email,
    }).lean();

    if (!currentUser) {
      return createErrorResponse("User not found", 404);
    }

    const userId = currentUser._id;
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get("countOnly") === "true";

    if (countOnly) {
      const counts = await getSkillCounts(userId);
      return NextResponse.json({
        success: true,
        ...counts,
      });
    } else {
      const userSkills = await getFullSkillData(userId);
      return NextResponse.json({
        success: true,
        data: userSkills,
      });
    }
  } catch (error) {
    console.error("GET /api/userskills Error:", error);
    return createErrorResponse("Server Error fetching user skills", 500);
  }
}

/**
 * @desc    Update user's current and/or desired skills
 * @route   PUT /api/userskills
 * @access  Private
 */
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
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

    // Extract and validate inputs
    const { currentSkills = [], desiredSkillIds = [] } = body;
    console.log("received request body:", {
      currentSkillcount: currentSkills.length,
      desiredSkillsCount: desiredSkillIds.length,
    });

    // Ensure at least one type of skill is provided
    if (currentSkills.length === 0 && desiredSkillIds.length === 0) {
      return createErrorResponse(
        "Request body must contain 'currentSkills' or 'desiredSkillIds'",
        400
      );
    }

    // Validate current skills format
    const currentSkillsError = validateCurrentSkills(currentSkills);
    if (currentSkillsError) {
      return createErrorResponse(currentSkillsError, 400);
    }

    // Validate desired skills format
    const desiredSkillsError = validateDesiredSkills(desiredSkillIds);
    if (desiredSkillsError) {
      return createErrorResponse(desiredSkillsError, 400);
    }

    // Find user
    const currentUser = await User.findOne({
      email: session.user.email,
    }).lean();

    if (!currentUser) {
      return createErrorResponse("User not found", 404);
    }

    const userId = currentUser._id;

    // Start transaction
    mongoSession = await mongoose.startSession();
    let updatedUserSkills;

    await mongoSession.withTransaction(async (txSession) => {
      updatedUserSkills = await updateUserSkills({
        userId,
        currentSkills,
        desiredSkillIds,
        session: txSession,
      });
    });
    console.log(
      `transaction completed,returning ${updatedUserSkills?.length || 0} skills`
    );
    return NextResponse.json({
      success: true,
      data: updatedUserSkills,
    });
  } catch (error) {
    console.error("PUT /api/userskills Error:", error);
    console.error("Error stack:", error.stack);

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
      return createErrorResponse(
        "Duplicate key error - skill may already exist for user",
        409
      );
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
