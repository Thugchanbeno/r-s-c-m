import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notification from "@/models/Notifications";

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { notificationIds } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No notification IDs provided" },
        { status: 400 }
      );
    }

    // Delete notifications
    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "No notifications found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} notification${
        result.deletedCount !== 1 ? "s" : ""
      } deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("API Error deleting notifications:", error);
    return NextResponse.json(
      { success: false, error: "Server Error deleting notifications" },
      { status: 500 }
    );
  }
}