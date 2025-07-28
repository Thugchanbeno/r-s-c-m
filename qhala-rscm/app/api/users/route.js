import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Skills from "@/models/Skills";
import UserSkills from "@/models/UserSkills";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

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
    const countOnly = searchParams.get("countOnly") === "true";
    const searchTerm = searchParams.get("search");
    const skillName = searchParams.get("skillName");

    let query = {};
    const andConditions = [];

    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      andConditions.push({
        $or: [{ name: regex }, { email: regex }, { department: regex }],
      });
    }

    if (skillName) {
      const skills = await Skills.find({
        name: new RegExp(skillName, "i"),
      }).select("_id");

      if (skills.length > 0) {
        const skillIds = skills.map((skill) => skill._id);

        const userSkillEntries = await UserSkills.find({
          skillId: { $in: skillIds },
          isCurrent: true,
        }).select("userId");

        if (userSkillEntries.length > 0) {
          const userIdsWithSkill = userSkillEntries.map(
            (entry) => entry.userId
          );
          andConditions.push({ _id: { $in: userIdsWithSkill } });
        } else {
          andConditions.push({ _id: new mongoose.Types.ObjectId() });
        }
      } else {
        andConditions.push({ _id: new mongoose.Types.ObjectId() });
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    if (countOnly) {
      const count = await User.countDocuments(query);
      return NextResponse.json({ success: true, count: count });
    } else {
      const users = await User.find(query)
        .select("-authProviderId")
        // .populate("currentSkills", "name category")
        .sort({ name: 1 });
      return NextResponse.json({
        success: true,
        count: users.length,
        data: users,
      });
    }
  } catch (error) {
    console.error("API Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching users" },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const allowedCreateRoles = ["hr", "admin"];

  if (!session.user?.role || !allowedCreateRoles.includes(session.user.role)) {
    return NextResponse.json(
      { message: "Forbidden: Cannot create users" },
      { status: 403 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();

    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      name: body.name,
      email: body.email,
      department: body.department,
      role: body.role,
      availabilityStatus: body.availabilityStatus,
      authProviderId: "pending_invite",
    });

    if (body.skills && body.skills.length > 0) {
      const userSkills = body.skills.map((skill) => ({
        userId: newUser._id,
        skillId: new mongoose.Types.ObjectId(skill.id),
        proficiencyLevel: 3,
        isCurrent: true,
        isDesired: false,
      }));
      await UserSkills.insertMany(userSkills);
    }

    const userResponse = newUser.toObject();
    delete userResponse.authProviderId;

    return NextResponse.json(
      { success: true, data: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error creating user:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error creating user" },
      { status: 500 }
    );
  }
}
