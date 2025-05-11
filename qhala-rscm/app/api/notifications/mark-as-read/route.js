// app/api/notifications/mark-all-read/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notifications from "@/models/Notifications";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const result = await Notifications.updateMany(
      { userId: session.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read.`,
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
