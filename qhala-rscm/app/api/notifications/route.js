import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notifications from "@/models/Notifications";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const skip = (page - 1) * limit;

  try {
    await connectDB();

    const notifications = await Notifications.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalNotificationss = await Notifications.countDocuments({
      userId: session.user.id,
    });
    const unreadCount = await Notifications.countDocuments({
      userId: session.user.id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount: unreadCount,
      totalNotificationss: totalNotificationss,
      currentPage: page,
      totalPages: Math.ceil(totalNotificationss / limit),
    });
  } catch (error) {
    console.error("API Error fetching notificationss:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching notificationss." },
      { status: 500 }
    );
  }
}
