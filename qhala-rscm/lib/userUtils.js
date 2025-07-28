import connectDB from "@/lib/db";
import User from "@/models/User";
import Allocation from "@/models/Allocation";

export async function updateUserAvailabilityStatus(userId) {
  try {
    await connectDB();
    const now = new Date();

    const activeAllocations = await Allocation.find({
      userId: userId,
      status: "active",
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: now } }, { endDate: null }],
    });

    const totalAllocation = activeAllocations.reduce(
      (sum, alloc) => sum + alloc.allocationPercentage,
      0
    );

    const newStatus = totalAllocation >= 100 ? "unavailable" : "available";
    const user = await User.findById(userId);

    if (user && user.availabilityStatus !== newStatus) {
      user.availabilityStatus = newStatus;
      await user.save();
      console.log(
        `User ${userId} status automatically updated to: ${newStatus} (Total Allocation: ${totalAllocation}%)`
      );
    }
  } catch (error) {
    console.error(
      `Error updating availability status for user ${userId}:`,
      error
    );
  }
}
