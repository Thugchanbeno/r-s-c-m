import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notifications from "@/models/Notifications";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ count: 0 });
  }

  try {
    await connectDB();
    const unreadCount = await Notifications.countDocuments({
      userId: session.user.id,
      isRead: false,
    });
    return NextResponse.json({ success: true, count: unreadCount });
  } catch (error) {
    console.error("API Error fetching notification count:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
