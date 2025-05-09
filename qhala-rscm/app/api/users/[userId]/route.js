import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

// @desc    Get a single user by ID
// @route   GET /api/users/[userId]
// @access  Private (Example: HR/Admin only)
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  //  Authorization Check (Placeholder - Implement with actual roles)
  // const allowedRoles = ['hr', 'admin'];
  // if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
  //   console.warn(`User ${session.user?.email} attempted to access restricted route GET /api/users/[id]`);
  //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  // }

  try {
    await connectDB();

    const { userId } = params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }
    const user = await User.findById(userId).select("-authProviderId");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error(`API Error fetching user ${params.userId}:`, error);
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error fetching user" },
      { status: 500 }
    );
  }
}

//PUT api/users/[userId]
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Ensure only admin/hr can update user roles/details
  const allowedUpdateRoles = ["admin", "hr"];
  if (!session.user?.role || !allowedUpdateRoles.includes(session.user.role)) {
    return NextResponse.json(
      { message: "Forbidden: Cannot update user details" },
      { status: 403 }
    );
  }

  const { userId } = params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { success: false, error: "Invalid User ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();

    // Fields that can be updated by admin/hr
    const updateData = {};
    if (body.role) {
      // Validate role if provided
      const allowedRolesEnum = User.schema.path("role").enumValues;
      if (!allowedRolesEnum.includes(body.role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role value: ${body.role}` },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }
    if (body.department !== undefined) {
      // Allow setting department to empty string
      updateData.department = body.department;
    }
    if (body.availabilityStatus) {
      // Check if availabilityStatus is provided
      // Validate availabilityStatus if provided
      const allowedAvailabilityStatusEnum =
        User.schema.path("availabilityStatus").enumValues;
      if (!allowedAvailabilityStatusEnum.includes(body.availabilityStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid availability status: ${body.availabilityStatus}`,
          },
          { status: 400 }
        );
      }
      updateData.availabilityStatus = body.availabilityStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No update data provided" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validations are run
    }).select("-authProviderId"); // Exclude sensitive fields

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(`API Error updating user ${userId}:`, error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error updating user" },
      { status: 500 }
    );
  }
}
