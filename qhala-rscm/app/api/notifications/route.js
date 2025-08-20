import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Notification from "@/models/Notifications";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 20;
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const dateRange = searchParams.get("dateRange") || "all";
  const type = searchParams.get("type") || "all";

  try {
    await connectDB();

    
    const query = {
      userId: session.user.id,
    };
    if (status === "read") {
      query.isRead = true
    } else if (status === "unread") {
      query.isRead = false
    } else if (status === "all") 
    if (type !== "all") {
      query.type = type;
    }

    if (search) {
      query.message = { $regex: search, $options: "i" };
    }

    if (dateRange !== "all") {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }


    const skip = (page - 1) * limit;
    const [notifications, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);
    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      isRead: false,
      isArchived: { $ne: true },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: notifications,
      currentPage: page,
      totalPages,
      totalCount,
      unreadCount,
    });
  } catch (error) {
    console.error("API Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching notifications." },
      { status: 500 }
    );
  }
}