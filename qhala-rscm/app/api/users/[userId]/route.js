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

  // Authorization Check
  // const allowedRoles = ['hr', 'admin'];
  // if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
  //   console.warn(`User ${session.user?.email} attempted to access restricted route PUT /api/users/[id]`);
  //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  // }

  try {
    await connectDB();

    const { userId } = params;
    const body = await request.json();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }
    const { role, department } = body;
    const updateData = {};
    if (role) {
      const allowedRoles = User.schema.path("role").enumValues;
      if (!allowedRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: "Invalid role" },
          { status: 400 }
        );
      }
      updateData.role = role;
    }
    if (department !== undefined) {
      updateData.department = department;
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-authProviderId");
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(`API Error updating user ${params.userId}:`, error);
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }
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
