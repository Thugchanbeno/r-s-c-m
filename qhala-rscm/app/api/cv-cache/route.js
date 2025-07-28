import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import CvCache from "@/models/CvCache";
import connectDB from "@/lib/db";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const allowedRoles = ["hr", "admin", "pm"];
  if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");

    let query = {};
    if (skill) {
      query = { "extractedSkills.name": new RegExp(skill, "i") };
    }

    const cvs = await CvCache.find(query).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ success: true, data: cvs });
  } catch (error) {
    console.error("API Error fetching CV cache:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching cached CVs" },
      { status: 500 }
    );
  }
}
