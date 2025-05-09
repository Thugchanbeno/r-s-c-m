import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const { projectId } = params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return NextResponse.json(
      { success: false, error: "Invalid Project ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const project = await Project.findById(projectId).populate(
      "pmId",
      "name email"
    );

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error(`API Error fetching project ${projectId}:`, error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching project details" },
      { status: 500 } // Internal Server Error
    );
  }
}

// You can also add PUT, DELETE handlers here later if needed for updating/deleting projects
// export async function PUT(request, { params }) { ... }
// export async function DELETE(request, { params }) { ... }
