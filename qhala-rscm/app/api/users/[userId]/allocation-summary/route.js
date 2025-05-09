import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Allocation from "@/models/Allocation";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const STANDARD_WORK_WEEK_HOURS = 40;

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;

  if (
    session.user.id !== userId &&
    !["admin", "hr"].includes(session.user.role)
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { success: false, error: "Invalid User ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const userExists = await User.findById(userId).countDocuments();
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    const activeAllocations = await Allocation.find({
      userId: userId,
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: now } }, { endDate: null }],
    });

    let totalAllocatedHours = 0;
    activeAllocations.forEach((allocation) => {
      // Calculate hours for this allocation based on its percentage of the standard week
      const hoursForThisAllocation =
        (allocation.allocationPercentage / 100) * STANDARD_WORK_WEEK_HOURS;
      totalAllocatedHours += hoursForThisAllocation;
    });

    // Calculate the total allocation percentage based on the standard work week
    const totalCurrentCapacityPercentage =
      STANDARD_WORK_WEEK_HOURS > 0
        ? Math.round((totalAllocatedHours / STANDARD_WORK_WEEK_HOURS) * 100)
        : 0;
    // Math.round to keep it as a whole number, or use .toFixed(1) for one decimal place

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        totalCurrentCapacityPercentage: totalCurrentCapacityPercentage,
        totalAllocatedHours: totalAllocatedHours,
        activeAllocationCount: activeAllocations.length,
        standardWorkWeekHours: STANDARD_WORK_WEEK_HOURS,
      },
    });
  } catch (error) {
    console.error(
      `API Error fetching allocation summary for user ${userId}:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Server Error fetching allocation summary" },
      { status: 500 }
    );
  }
}
