// app/api/skills/[skillId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Skills from "@/models/Skills";
import UserSkills from "@/models/UserSkills";
import mongoose from "mongoose";

/**
 * @desc    Delete a skill and remove it from all users who have it
 * @route   DELETE /api/skills/:skillId
 * @access  Admin only
 */
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check for admin role
  if (session.user.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden - Admin access required",
      },
      { status: 403 }
    );
  }

  // Get skillId from params
  const { skillId } = params;

  // Validate skill ID format
  if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid skill ID format",
      },
      { status: 400 }
    );
  }

  let mongoSession = null;

  try {
    await connectDB();

    // Start a transaction for data consistency
    mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    // Check if skill exists
    const skill = await Skills.findById(skillId).session(mongoSession);
    if (!skill) {
      await mongoSession.abortTransaction();
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    // Delete all user associations with this skill
    const userSkillsResult = await UserSkills.deleteMany({
      skillId: skillId,
    }).session(mongoSession);

    // Delete the skill itself
    await Skills.findByIdAndDelete(skillId).session(mongoSession);

    // Commit the transaction
    await mongoSession.commitTransaction();

    return NextResponse.json({
      success: true,
      message: `Skill "${skill.name}" deleted successfully`,
      userSkillsRemoved: userSkillsResult.deletedCount,
    });
  } catch (error) {
    // Abort transaction on error
    if (mongoSession) {
      await mongoSession.abortTransaction();
    }

    console.error("API Error deleting skill:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server Error deleting skill",
      },
      { status: 500 }
    );
  } finally {
    // Ensure session is ended
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
}
