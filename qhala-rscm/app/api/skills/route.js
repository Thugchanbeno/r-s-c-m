import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Skills from "@/models/Skills";
import User from "@/models/User";
import UserSkills from "@/models/UserSkills";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // TODO: Add filtering by category? Sorting?
    const skills = await Skills.find({}).sort({ category: 1, name: 1 });

    return NextResponse.json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("API Error fetching skills:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching skills" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // const allowedRoles = ['hr', 'admin'];
  // if (!allowedRoles.includes(session.user.role)) {
  //    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  // }

  try {
    await connectDB();
    const body = await request.json();

    const { name, category, description, aliases } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Skill name is required" },
        { status: 400 }
      );
    }
    const existingSkill = await Skills.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existingSkill) {
      return NextResponse.json(
        { success: false, error: `Skill '${name}' already exists` },
        { status: 400 }
      );
    }

    const skillData = {
      name: name,
      category: category,
      description: description,
      aliases: aliases || [],
    };

    const newSkill = await Skills.create(skillData);

    return NextResponse.json(
      { success: true, data: newSkill },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error creating skill:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 }
      );
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return NextResponse.json(
        {
          success: false,
          error: `Skill '${error.keyValue.name}' already exists (duplicate key).`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error creating skill" },
      { status: 500 }
    );
  }
}
