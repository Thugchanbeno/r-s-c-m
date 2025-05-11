import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Allocation from "@/models/Allocation";
import Project from "@/models/Project";
import mongoose from "mongoose";
import User from "@/models/User";

// @desc    Get allocation summary statistics
// @route   GET /api/allocations/summary?pmId=...&scope=overall
// @access  Private
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pmId = searchParams.get("pmId");
  const scope = searchParams.get("scope");
  const loggedInUserId = session.user.id;
  const loggedInUserRole = session.user.role;

  try {
    await connectDB();
    let summary = {};

    if (scope === "overall") {
      // Authorization: Only Admin or HR can see overall summary
      if (!["admin", "hr"].includes(loggedInUserRole)) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: Insufficient permissions for overall summary.",
          },
          { status: 403 }
        );
      }

      const STANDARD_WORK_WEEK_HOURS = 40;
      const now = new Date();
      const allUsers = await User.find({}).select(
        "_id standardHoursPerWeek name"
      );
      let totalCompanyAllocatedHours = 0;
      let totalCompanyStandardHours = 0;
      for (const user of allUsers) {
        const userStandardHours =
          user.standardHoursPerWeek || STANDARD_WORK_WEEK_HOURS;
        totalCompanyStandardHours += userStandardHours;
        const activeAllocations = await Allocation.find({
          userId: user._id,
          startDate: { $lte: now },
          $or: [{ endDate: { $gte: now } }, { endDate: null }],
        });
        let userAllocatedHours = 0;
        activeAllocations.forEach((allocation) => {
          userAllocatedHours +=
            (allocation.allocationPercentage / 100) * userStandardHours;
        });
        totalCompanyAllocatedHours += userAllocatedHours;
      }
      summary.overallAverageCapacityUtilization =
        totalCompanyStandardHours > 0
          ? Math.round(
              (totalCompanyAllocatedHours / totalCompanyStandardHours) * 100
            )
          : 0;
      summary.totalCompanyAllocatedHours = totalCompanyAllocatedHours;
      summary.totalCompanyStandardHours = totalCompanyStandardHours;
    } else if (pmId) {
      //Calculate summary for a specific PM
      if (!mongoose.Types.ObjectId.isValid(pmId)) {
        return NextResponse.json(
          { success: false, error: "Invalid PM ID format" },
          { status: 400 }
        );
      }
      // AUTHORIZATION CHECK FOR pmId SCOPE
      if (
        loggedInUserId !== pmId &&
        !["admin", "hr"].includes(loggedInUserRole)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Forbidden: You can only view your own summary or have admin/hr privileges.",
          },
          { status: 403 }
        );
      }
      const pmProjects = await Project.find({ pmId: pmId }).select("_id");
      const pmProjectIds = pmProjects.map((p) => p._id);

      if (pmProjectIds.length > 0) {
        const uniqueUsersResult = await Allocation.distinct("userId", {
          projectId: { $in: pmProjectIds },
          // Optional: Add date filters here if "allocated resources" should only count currently active ones
          // startDate: { $lte: new Date() },
          // $or: [{ endDate: { $gte: new Date() } }, { endDate: null }],
        });
        summary.uniqueUserCount = uniqueUsersResult.length;
      } else {
        summary.uniqueUserCount = 0;
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Missing required scope or pmId parameter" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error("API Error fetching allocation summary:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching allocation summary" },
      { status: 500 }
    );
  }
}
