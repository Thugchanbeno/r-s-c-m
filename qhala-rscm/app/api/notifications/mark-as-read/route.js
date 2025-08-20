import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notification from "@/models/Notifications"; 

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { notificationIds } = body;

    let result;

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      if (notificationIds.length === 0) {
        return NextResponse.json(
          { success: false, error: "No notification IDs provided" },
          { status: 400 }
        );
      }

      result = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          userId: session.user.id,
        },
        {
          $set: { isRead: true, readAt: new Date() },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: "No notifications found" },
          { status: 404 }
        );
      }
    } else {
      // Mark all unread notifications as read (for backward compatibility)
      result = await Notification.updateMany(
        { userId: session.user.id, isRead: false, isArchived: { $ne: true } },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} notification${
        result.modifiedCount !== 1 ? "s" : ""
      } marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("API Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, error: "Server Error marking notifications as read." },
      { status: 500 }
    );
  }
}