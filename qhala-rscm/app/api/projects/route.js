// app/api/projects/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import Skills from "@/models/Skills";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // if (
  //   session.user.role !== "admin" &&
  //   session.user.role !== "pm" &&
  //   session.user.role !== "hr"
  // ) {
  //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  // }
  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("countOnly") === "true";
  const pmId = searchParams.get("pmId");
  // const status = searchParams.get('status');
  // const limit = parseInt(searchParams.get('limit') || '0'); // Example limit

  try {
    await connectDB();
    let query = {};
    if (pmId) {
      if (!mongoose.Types.ObjectId.isValid(pmId)) {
        return NextResponse.json(
          { success: false, error: "Invalid PM ID format" },
          { status: 400 }
        );
      }
      query.pmId = pmId;
    }
    if (countOnly) {
      const count = await Project.countDocuments(query);
      return NextResponse.json({ success: true, count: count });
    } else {
      const projects = await Project.find(query)
        .populate("pmId", "name email")
        .populate("requiredSkills.skillId", "name category");
      // .sort({ createdAt: -1 })
      // .limit(limit > 0 ? limit : null); // Example limit for pagination maybe? later?

      return NextResponse.json({
        success: true,
        count: projects.length,
        data: projects,
      });
    }
  } catch (error) {
    console.error("API Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching projects" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["pm", "hr", "admin"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { message: "Forbidden: Insufficient role" },
      { status: 403 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, error: "Project name and description are required" },
        { status: 400 }
      );
    }

    // TODO: Validate requiredSkills structure if provided
    // TODO: Potentially assign pmId based on logged-in user session.user.id if role is PM

    const newProject = await Project.create(body);

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error creating project:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error creating project" },
      { status: 500 }
    );
  }
}
