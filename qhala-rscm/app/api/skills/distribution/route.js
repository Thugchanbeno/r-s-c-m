import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Skills from "@/models/Skills";
import UserSkills from "@/models/UserSkills";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["admin", "hr"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    // 1. Fetch all skills from the taxonomy
    const allSkills = await Skills.find({})
      .sort({ category: 1, name: 1 })
      .lean();

    if (!allSkills || allSkills.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. For each skill, count current and desired users
    const skillDistributionData = [];
    const skillIds = allSkills.map((skill) => skill._id);

    // Fetch all relevant UserSkills entries in one go for efficiency
    const userSkillEntries = await UserSkills.find({
      skillId: { $in: skillIds },
    })
      .select("skillId isCurrent isDesired")
      .lean();

    // Process the UserSkills entries to count occurrences
    const skillCounts = userSkillEntries.reduce((acc, entry) => {
      const skillIdStr = entry.skillId.toString();
      if (!acc[skillIdStr]) {
        acc[skillIdStr] = { currentUserCount: 0, desiredUserCount: 0 };
      }
      if (entry.isCurrent) {
        acc[skillIdStr].currentUserCount++;
      }
      if (entry.isDesired) {
        acc[skillIdStr].desiredUserCount++;
      }
      return acc;
    }, {});

    // 3. Structure the data by category
    const categorizedSkills = allSkills.reduce((acc, skill) => {
      const categoryName = skill.category || "Uncategorized";
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: categoryName,
          skills: [],
        };
      }
      const counts = skillCounts[skill._id.toString()] || {
        currentUserCount: 0,
        desiredUserCount: 0,
      };
      acc[categoryName].skills.push({
        skillId: skill._id,
        name: skill.name,
        description: skill.description,
        currentUserCount: counts.currentUserCount,
        desiredUserCount: counts.desiredUserCount,
      });
      return acc;
    }, {});

    // Convert the categorizedSkills object into an array
    const finalData = Object.values(categorizedSkills);

    return NextResponse.json({ success: true, data: finalData });
  } catch (error) {
    console.error("API Error fetching skill distribution:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching skill distribution." },
      { status: 500 }
    );
  }
}
