import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Allocation from "@/models/Allocation";
import { updateUserAvailabilityStatus } from "@/lib/userUtils";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const now = new Date();

    const expiredAllocations = await Allocation.find({
      endDate: { $lt: now },
      status: "active",
    }).select("userId");

    if (expiredAllocations.length === 0) {
      console.log("Cron Job: No expired allocations to process.");
      return NextResponse.json({
        success: true,
        message: "No expired allocations found.",
      });
    }
    const userIdsToUpdate = [
      ...new Set(expiredAllocations.map((alloc) => alloc.userId.toString())),
    ];

    const updateResult = await Allocation.updateMany(
      {
        endDate: { $lt: now },
        status: "active",
      },
      { $set: { status: "completed" } }
    );
    await Promise.all(
      userIdsToUpdate.map((userId) => updateUserAvailabilityStatus(userId))
    );

    const message = `Successfully processed ${updateResult.modifiedCount} expired allocations and updated ${userIdsToUpdate.length} users.`;
    console.log(`Cron Job: ${message}`);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Cron Job Error cleaning up allocations:", error);
    return NextResponse.json(
      { success: false, error: "Server Error during cron job execution" },
      { status: 500 }
    );
  }
}
