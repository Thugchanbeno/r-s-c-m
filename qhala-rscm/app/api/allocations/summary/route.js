import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Allocation from "@/models/Allocation";
import Project from "@/models/Project";
import mongoose from "mongoose";

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

  try {
    await connectDB();

    // TODO: Implement role checks. Who can see overall stats? Can PMs only see their own?
    // if (scope === 'overall' && !['admin', 'hr'].includes(session.user.role)) { /* Forbidden */ }
    // if (pmId && session.user.role !== 'admin' && session.user.role !== 'hr' && session.user.id !== pmId) { /* Forbidden */ }

    let summary = {};

    if (scope === "overall") {
      // Calculate overall average allocation (example - might need refinement)
      // This is a simplified average, doesn't account for overlapping time periods accurately
      const overallResult = await Allocation.aggregate([
        {
          $group: { _id: "$userId", totalAllocation: { $sum: "$percentage" } },
        },
        {
          $group: {
            _id: null,
            averageAllocation: { $avg: "$totalAllocation" },
          },
        },
      ]);
      summary.overallAverageAllocation =
        overallResult[0]?.averageAllocation?.toFixed(1) || 0;
    } else if (pmId) {
      // Calculate summary for a specific PM
      if (!mongoose.Types.ObjectId.isValid(pmId)) {
        /* Invalid ID */
      }

      // Find projects managed by this PM
      const pmProjects = await Project.find({ pmId: pmId }).select("_id");
      const pmProjectIds = pmProjects.map((p) => p._id);

      if (pmProjectIds.length > 0) {
        // Find unique users allocated to these projects
        const uniqueUsersResult = await Allocation.distinct("userId", {
          projectId: { $in: pmProjectIds },
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
