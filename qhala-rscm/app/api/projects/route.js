import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project, { departmentEnum } from "@/models/Project";
import "@/models/Skills";
import "@/models/User";
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
      if (!mongoose.Types.ObjectId.isValid(pmId)) {
        return NextResponse.json(
          { success: false, error: "Invalid PM ID format" },
          { status: 400 }
        );
      }
      if (
        loggedInUserId !== pmId &&
        !["admin", "hr", "pm"].includes(loggedInUserRole)
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
      if (!["admin", "hr", "pm"].includes(loggedInUserRole)) {
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

    if (!body.name || !body.description || !body.department) {
      return NextResponse.json(
        {
          success: false,
          error: "Project name, description, and department are required",
        },
        { status: 400 }
      );
    }

    if (!departmentEnum.includes(body.department)) {
      return NextResponse.json(
        { success: false, error: "Invalid department value provided." },
        { status: 400 }
      );
    }

    if (body.requiredSkills && !Array.isArray(body.requiredSkills)) {
      return NextResponse.json(
        { success: false, error: "requiredSkills must be an array" },
        { status: 400 }
      );
    }
    if (body.requiredSkills) {
      for (const skill of body.requiredSkills) {
        if (
          !skill.skillId ||
          !skill.skillName ||
          typeof skill.proficiencyLevel !== "number" ||
          typeof skill.isRequired !== "boolean"
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Invalid structure in requiredSkills. Each skill must have skillId, skillName, proficiencyLevel (number), and isRequired (boolean).",
            },
            { status: 400 }
          );
        }
      }
    }

    const newProjectData = {
      name: body.name,
      description: body.description,
      department: body.department,
      status: body.status || "Planning",
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      pmId: session.user.id,
      requiredSkills: body.requiredSkills || [],
      nlpExtractedSkills: body.nlpExtractedSkills || [],
    };

    const newProject = await Project.create(newProjectData);

    const populatedProject = await Project.findById(newProject._id).populate(
      "pmId",
      "name email"
    );

    return NextResponse.json(
      { success: true, data: populatedProject || newProject },
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
