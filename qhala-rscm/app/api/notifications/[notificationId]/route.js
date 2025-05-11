import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notifications from "@/models/Notifications";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { notificationId } = params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return NextResponse.json(
      { success: false, error: "Invalid Notification ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    const notification = await Notifications.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    // Ensure the user is trying to mark their own notification as read
    if (notification.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot access this notification" },
        { status: 403 }
      );
    }

    // If already read, no need to update, just return success
    let updated = false;
    if (
      body.hasOwnProperty("isRead") &&
      typeof body.isRead === "boolean" &&
      notification.isRead !== body.isRead
    ) {
      notification.isRead = body.isRead;
      updated = true;
    }

    if (updated) {
      await notification.save();
      return NextResponse.json({
        success: true,
        data: notification,
        message: "Notification updated.",
      });
    } else {
      // No actual changes were made, or no valid update fields provided
      return NextResponse.json({
        success: true,
        data: notification,
        message: "No changes applied to notification.",
      });
    }
  } catch (error) {
    console.error(
      `API Error marking notification ${notificationId} as read:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Server Error marking notification as read." },
      { status: 500 }
    );
  }
}
