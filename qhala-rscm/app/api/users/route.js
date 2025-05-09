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
      //  Find skill IDs that match the skillName
      const skills = await Skills.find({
        name: new RegExp(skillName, "i"),
      }).select("_id");

      if (skills.length > 0) {
        const skillIds = skills.map((skill) => skill._id);

        //  Find UserSkill documents for these skills where isCurrent is true
        const userSkillEntries = await UserSkills.find({
          skillId: { $in: skillIds },
          isCurrent: true,
        }).select("userId");

        if (userSkillEntries.length > 0) {
          const userIdsWithSkill = userSkillEntries.map(
            (entry) => entry.userId
          );
          // 3. Add condition to find users who have these IDs
          andConditions.push({ _id: { $in: userIdsWithSkill } });
        } else {
          // No users have this current skill, so add an impossible condition
          andConditions.push({ _id: new mongoose.Types.ObjectId() });
        }
      } else {
        // No skill found by that name, so add an impossible condition
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
        // You might not need to populate currentSkills here anymore if you're not displaying them directly from User model
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

    if (!body.email || !body.name || !body.role || !body.authProviderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, role, and authProviderId are required",
        },
        { status: 400 }
      );
    }

    const allowedRolesEnum = User.schema.path("role").enumValues;
    if (!allowedRolesEnum.includes(body.role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role value: ${body.role}` },
        { status: 400 }
      );
    }
    const existingUser = await User.findOne({
      $or: [{ email: body.email }, { authProviderId: body.authProviderId }],
    });
    if (existingUser) {
      let errorMsg =
        existingUser.email === body.email
          ? "User with this email already exists"
          : "User with this auth provider ID already exists";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const newUser = await User.create(body);
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
