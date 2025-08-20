import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notification from "@/models/Notifications";
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
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot access this notification" },
        { status: 403 }
      );
    }

    let updated = false;
    if (
      body.hasOwnProperty("isRead") &&
      typeof body.isRead === "boolean" &&
      notification.isRead !== body.isRead
    ) {
      notification.isRead = body.isRead;
      if (body.isRead) {
        notification.readAt = new Date();
      }
      updated = true;
    }

    // Handle isArchived update
    if (
      body.hasOwnProperty("isArchived") &&
      typeof body.isArchived === "boolean" &&
      notification.isArchived !== body.isArchived
    ) {
      notification.isArchived = body.isArchived;
      if (body.isArchived) {
        notification.archivedAt = new Date();
      }
      updated = true;
    }

    if (updated) {
      await notification.save();
      return NextResponse.json({
        success: true,
        data: notification,
        message: "Notification updated successfully",
      });
    } else {
      return NextResponse.json({
        success: true,
        data: notification,
        message: "No changes applied to notification",
      });
    }
  } catch (error) {
    console.error(`API Error updating notification ${notificationId}:`, error);
    return NextResponse.json(
      { success: false, error: "Server Error updating notification" },
      { status: 500 }
    );
  }
}


