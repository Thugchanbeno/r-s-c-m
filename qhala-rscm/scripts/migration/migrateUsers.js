import User from "../../models/User.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateUsers() {
  console.log("Starting user migration...");

  await connectMongoDB();

  try {
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      logProgress(i + 1, users.length, "users");

      try {
        const convexUser = {
          name: user.name,
          email: user.email,
          authProviderId: user.authProviderId,
          department: user.department || undefined,
          function: user.function || "qhala",
          employeeType: user.employeeType || "permanent",
          weeklyHours: user.weeklyHours || 40,
          role: user.role,
          lineManagerId: user.lineManagerId
            ? user.lineManagerId.toString()
            : undefined,
          contractStartDate: user.contractStartDate
            ? user.contractStartDate.getTime()
            : undefined,
          contractEndDate: user.contractEndDate
            ? user.contractEndDate.getTime()
            : undefined,
          paymentTerms: user.paymentTerms || undefined,
          avatarUrl: user.avatarUrl || undefined,
          availabilityStatus: user.availabilityStatus || "available",
        };

        const convexId = await convex.mutation(api.users.create, convexUser);

        mappings.userIdMapping[user._id.toString()] = convexId;
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    saveMappings(mappings);
    console.log("✅ User migration completed!");
  } catch (error) {
    console.error("❌ User migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUsers();
}