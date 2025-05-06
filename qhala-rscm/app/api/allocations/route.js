import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Allocation from "@/models/Allocation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// @desc    Get allocations (needs filtering, e.g., by user or project currently only by user implemented)
// @route   GET /api/allocations?userId=...&projectId=...
// @access  Private (Requires login, potentially role-specific filtering)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");

  // Basic security: Users should only see their own allocations unless they are PM/HR/Admin
  // TODO: Implement proper authorization logic based on user role and query params

  try {
    await connectDB();

    let query = {};
    if (userId) {
      // Add validation if userId is expected to be ObjectId
      query.userId = userId;
    }
    if (projectId) {
      // Add validation if projectId is expected to be ObjectId
      query.projectId = projectId;
    }

    // Prevent fetching all allocations without filter unless authorized
    if (
      Object.keys(query).length === 0 /* && !isAdminOrHR(session.user.role) */
    ) {
      return NextResponse.json(
        { success: false, error: "User ID or Project ID filter is required" },
        { status: 400 }
      );
    }

    const allocations = await Allocation.find(query)
      .populate("userId", "name email")
      .populate("projectId", "name");
    // .sort({ startDate: 1 }); sorting might need to be implemented basing on creation or project urgency

    return NextResponse.json({
      success: true,
      count: allocations.length,
      data: allocations,
    });
  } catch (error) {
    console.error("API Error fetching allocations:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching allocations" },
      { status: 500 }
    );
  }
}

// @desc    Create a new allocation (likely restricted to PM/HR/Admin)
// @route   POST /api/allocations
// @access  Private (Example: PM/HR/Admin only)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // const allowedRoles = ['pm', 'hr', 'admin'];
  // if (!allowedRoles.includes(session.user.role)) {
  //    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  // }
  // TODO: Add logic: PMs can only allocate to *their* projects?

  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    if (
      !body.userId ||
      !body.projectId ||
      body.percentage == null ||
      !body.startDate ||
      !body.endDate
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "User ID, Project ID, Percentage, Start Date, and End Date are required",
        },
        { status: 400 }
      );
    }
    // TODO: Add more validation (dates are valid, percentage is 0-100, user/project exist)

    const newAllocation = await Allocation.create(body);

    return NextResponse.json(
      { success: true, data: newAllocation },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error creating allocation:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error creating allocation" },
      { status: 500 }
    );
  }
}
