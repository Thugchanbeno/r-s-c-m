import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Allocation from "@/models/Allocation";
import User from "@/models/User";
import Project from "@/models/Project";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

// @desc    Update an allocation
// @route   PUT /api/allocations/[allocationId]
// @access  Private (Admin/HR only)
export async function PUT(request, { params }) {
  const { allocationId } = params;

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only admins and HR can update allocations
  if (!["admin", "hr"].includes(session.user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden: Only admins or HR can update allocations",
      },
      { status: 403 }
    );
  }

  // Validate the allocation ID format
  if (!mongoose.Types.ObjectId.isValid(allocationId)) {
    return NextResponse.json(
      { success: false, error: "Invalid allocation ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Find the existing allocation
    const existingAllocation = await Allocation.findById(allocationId);
    if (!existingAllocation) {
      return NextResponse.json(
        { success: false, error: "Allocation not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData = {};

    // Validate User ID if provided
    if (body.userId) {
      if (!mongoose.Types.ObjectId.isValid(body.userId)) {
        return NextResponse.json(
          { success: false, error: "Invalid User ID format." },
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
      updateData.userId = body.userId;
    }

    // Validate Project ID if provided
    if (body.projectId) {
      if (!mongoose.Types.ObjectId.isValid(body.projectId)) {
        return NextResponse.json(
          { success: false, error: "Invalid Project ID format." },
          { status: 400 }
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
      updateData.projectId = body.projectId;
    }

    // Validate Allocation Percentage if provided
    if (body.allocationPercentage != null) {
      const percentageNum = Number(body.allocationPercentage);
      if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
        return NextResponse.json(
          {
            success: false,
            error: "Allocation percentage must be a number between 0 and 100.",
          },
          { status: 400 }
        );
      }
      updateData.allocationPercentage = percentageNum;
    }

    // Validate Role if provided
    if (body.role) {
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
      updateData.role = body.role;
    }

    // Handle Dates
    const newStartDate = body.startDate
      ? new Date(body.startDate)
      : existingAllocation.startDate;
    // Allow setting endDate to null or a valid date
    const newEndDate =
      body.endDate === null
        ? null
        : body.endDate
        ? new Date(body.endDate)
        : existingAllocation.endDate;

    if (newStartDate && newEndDate && newStartDate > newEndDate) {
      return NextResponse.json(
        { success: false, error: "End date cannot be before start date." },
        { status: 400 }
      );
    }
    // Only update dates if they were actually provided in the body
    if (body.startDate !== undefined) updateData.startDate = newStartDate;
    if (body.endDate !== undefined) updateData.endDate = newEndDate;

    // Check for overlapping allocations (excluding the current one being edited)
    const userIdToCheck = updateData.userId || existingAllocation.userId;
    const projectIdToCheck =
      updateData.projectId || existingAllocation.projectId;
    const startDateToCheck =
      updateData.startDate || existingAllocation.startDate;
    const endDateToCheck =
      updateData.endDate === undefined
        ? existingAllocation.endDate
        : updateData.endDate;

    const overlapQuery = {
      _id: { $ne: allocationId },
      userId: userIdToCheck,
      projectId: projectIdToCheck,
      $or: [{ endDate: null }, { endDate: { $gte: startDateToCheck } }],
      ...(endDateToCheck && { startDate: { $lte: endDateToCheck } }),
    };

    const overlappingAllocation = await Allocation.findOne(overlapQuery);

    if (overlappingAllocation) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This update would cause an overlapping active allocation for this user on this project.",
        },
        { status: 409 } // Conflict
      );
    }

    // Perform the update
    const updatedAllocation = await Allocation.findByIdAndUpdate(
      allocationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedAllocation) {
      return NextResponse.json(
        { success: false, error: "Allocation not found during update" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedAllocation });
  } catch (error) {
    console.error("API Error updating allocation:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages.join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server error updating allocation" },
      { status: 500 }
    );
  }
}

// @desc    Update an allocation
// @route   DELETE /api/allocations/[allocationId]
// @access  Private (Admin/HR only)
export async function DELETE(request, { params }) {
  const { allocationId } = params;

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!["admin", "hr"].includes(session.user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden: Only admins or HR can delete allocations",
      },
      { status: 403 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(allocationId)) {
    return NextResponse.json(
      { success: false, error: "Invalid allocation ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const allocation = await Allocation.findById(allocationId);

    if (!allocation) {
      return NextResponse.json(
        { success: false, error: "Allocation not found" },
        { status: 404 }
      );
    }

    await Allocation.findByIdAndDelete(allocationId);

    return NextResponse.json(
      { success: true, message: "Allocation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error deleting allocation:", error);
    return NextResponse.json(
      { success: false, error: "Server error deleting allocation" },
      { status: 500 }
    );
  }
}
