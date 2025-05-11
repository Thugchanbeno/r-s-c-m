import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Skill from "@/models/Skills";
import UserSkill from "@/models/UserSkills";

export async function GET(request) {
  console.log("API HIT: /api/skills/distribution");
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    console.log("Unauthorized access to /api/skills/distribution");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["admin", "hr"];
  if (!allowedRoles.includes(session.user.role)) {
    console.log(`Forbidden access for role: ${session.user.role}`);
    return NextResponse.json(
      { success: false, error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("DB Connected.");

    console.log("Fetching all skills from taxonomy...");
    const allSkills = await Skill.find({})
      .sort({ category: 1, name: 1 })
      .lean();
    console.log(`Found ${allSkills?.length || 0} skills in taxonomy.`);

    if (!allSkills || allSkills.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const skillIds = allSkills.map((skill) => skill._id);
    console.log(`Skill IDs from taxonomy: ${skillIds.length}`);

    console.log("Fetching UserSkill entries...");
    const userSkillEntries = await UserSkill.find({
      skillId: { $in: skillIds },
    })
      .select("skillId isCurrent isDesired userId")
      .lean();
    console.log(`Found ${userSkillEntries?.length || 0} UserSkill entries.`);

    console.log("Processing UserSkill entries for counts...");
    const skillCounts = userSkillEntries.reduce((acc, entry) => {
      if (entry.skillId) {
        // Check if skillId exists
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
      } else {
        console.warn("UserSkill entry found with missing skillId:", entry);
      }
      return acc;
    }, {});
    console.log("Processed skillCounts:", skillCounts);

    console.log("Structuring data by category...");
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

    const finalData = Object.values(categorizedSkills);
    console.log("Final data prepared for response. Count:", finalData.length);

    return NextResponse.json({ success: true, data: finalData });
  } catch (error) {
    console.error("API Error in /api/skills/distribution:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching skill distribution." },
      { status: 500 }
    );
  }
}
