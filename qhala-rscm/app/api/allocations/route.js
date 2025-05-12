import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Allocation from "@/models/Allocation";
import User from "@/models/User";
import Project from "@/models/Project";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get("userId");
  const projectIdParam = searchParams.get("projectId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  try {
    await connectDB();
    let query = {};

    if (userIdParam) {
      if (!mongoose.Types.ObjectId.isValid(userIdParam)) {
        return NextResponse.json(
          { success: false, error: "Invalid User ID" },
          { status: 400 }
        );
      }
      query.userId = userIdParam;
    }
    if (projectIdParam) {
      if (!mongoose.Types.ObjectId.isValid(projectIdParam)) {
        return NextResponse.json(
          { success: false, error: "Invalid Project ID" },
          { status: 400 }
        );
      }
      query.projectId = projectIdParam;
    }

    const isFetchingSpecific = userIdParam || projectIdParam;
    const isAdminOrHR = ["admin", "hr"].includes(session.user.role);

    if (isFetchingSpecific) {
      let canAccessSpecific = false;
      if (userIdParam && session.user.id === userIdParam)
        canAccessSpecific = true;
      if (isAdminOrHR) canAccessSpecific = true;

      if (!canAccessSpecific) {
        return NextResponse.json(
          { message: "Forbidden to view these specific allocations" },
          { status: 403 }
        );
      }
    } else {
      if (!isAdminOrHR) {
        return NextResponse.json(
          { message: "Forbidden to view all allocations" },
          { status: 403 }
        );
      }
    }

    const totalAllocations = await Allocation.countDocuments(query);
    const allocations = await Allocation.find(query)
      .populate("userId", "name email avatarUrl availabilityStatus")
      .populate("projectId", "name status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: allocations.length,
      totalAllocations,
      currentPage: page,
      totalPages: Math.ceil(totalAllocations / limit),
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

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!["admin", "hr"].includes(session.user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden: Only Admins or HR can directly create allocations.",
      },
      { status: 403 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();

    if (
      !body.userId ||
      !body.projectId ||
      body.allocationPercentage == null ||
      !body.role
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "User ID, Project ID, Role, and Allocation Percentage are required.",
        },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(body.userId) ||
      !mongoose.Types.ObjectId.isValid(body.projectId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID or Project ID format." },
        { status: 400 }
      );
    }

    const userExists = await User.findById(body.userId).countDocuments();
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const projectExists = await Project.findById(
      body.projectId
    ).countDocuments();
    if (!projectExists) {
      return NextResponse.json(
        { success: false, error: "Project not found." },
        { status: 404 }
      );
    }

    if (
      typeof body.allocationPercentage !== "number" ||
      body.allocationPercentage < 0 ||
      body.allocationPercentage > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Allocation percentage must be a number between 0 and 100.",
        },
        { status: 400 }
      );
    }

    const allowedRolesEnum = Allocation.schema.path("role").enumValues;
    if (!allowedRolesEnum.includes(body.role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid role: ${
            body.role
          }. Allowed roles are: ${allowedRolesEnum.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (
      body.startDate &&
      body.endDate &&
      new Date(body.startDate) > new Date(body.endDate)
    ) {
      return NextResponse.json(
        { success: false, error: "End date cannot be before start date." },
        { status: 400 }
      );
    }

    // Check for overlapping allocations
    const existingActiveAllocation = await Allocation.findOne({
      userId: body.userId,
      projectId: body.projectId,
      $or: [
        { endDate: null },
        { endDate: { $gte: body.startDate || new Date() } },
      ],
      ...(body.endDate && { startDate: { $lte: body.endDate } }),
    });

    if (existingActiveAllocation) {
      const newStart = body.startDate ? new Date(body.startDate) : new Date(0);
      const newEnd = body.endDate
        ? new Date(body.endDate)
        : new Date(9999, 11, 31);
      const existingStart = existingActiveAllocation.startDate
        ? new Date(existingActiveAllocation.startDate)
        : new Date(0);
      const existingEnd = existingActiveAllocation.endDate
        ? new Date(existingActiveAllocation.endDate)
        : new Date(9999, 11, 31);

      if (newStart <= existingEnd && newEnd >= existingStart) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This user already has an overlapping active allocation for this project.",
          },
          { status: 409 }
        );
      }
    }

    const newAllocationData = {
      userId: body.userId,
      projectId: body.projectId,
      allocationPercentage: body.allocationPercentage,
      role: body.role,
      startDate: body.startDate || new Date(),
      endDate: body.endDate || null,
    };

    const newAllocation = await Allocation.create(newAllocationData);

    return NextResponse.json(
      { success: true, data: newAllocation },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error creating allocation:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages.join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error creating allocation" },
      { status: 500 }
    );
  }
}
