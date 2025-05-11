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
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("countOnly") === "true";
  const pmId = searchParams.get("pmId");
  const loggedInUserId = session.user.id;
  const loggedInUserRole = session.user.role;

  try {
    await connectDB();
    let query = {};

    if (pmId) {
      // If a specific PM's projects are requested
      if (!mongoose.Types.ObjectId.isValid(pmId)) {
        return NextResponse.json(
          { success: false, error: "Invalid PM ID format" },
          { status: 400 }
        );
      }
      // Authorization: User must be the PM themselves, or an Admin/HR
      if (
        loggedInUserId !== pmId &&
        !["admin", "hr"].includes(loggedInUserRole)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Forbidden: You can only view your own projects or have admin/hr privileges.",
          },
          { status: 403 }
        );
      }
      query.pmId = pmId;
    } else {
      if (!["admin", "hr"].includes(loggedInUserRole)) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: Insufficient permissions to view all projects.",
          },
          { status: 403 }
        );
      }
    }

    if (countOnly) {
      const count = await Project.countDocuments(query);
      return NextResponse.json({ success: true, count: count });
    } else {
      const projects = await Project.find(query)
        .populate("pmId", "name email")
        .populate("requiredSkills.skillId", "name category")
        .sort({ name: 1 });

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
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const allowedRoles = ["pm", "hr", "admin"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { message: "Forbidden: Insufficient permissions to create projects" },
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
    const newProjectData = {
      ...body,
      pmId: session.user.id,
    };

    const newProject = await Project.create(newProjectData);

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
