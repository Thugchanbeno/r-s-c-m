import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import ResourceRequest from "@/models/ResourceRequest";
import Project from "@/models/Project";
import User from "@/models/User";
import mongoose from "mongoose";

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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    await connectDB();
    let query = {};

    if (status) {
      query.status = status;
    }

    const requests = await ResourceRequest.find(query)
      .populate("projectId", "name")
      .populate("requestedUserId", "name email image")
      .populate("requestedByPmId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("API Error fetching resource requests:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching resource requests." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Authorization: Only PMs, Admins, or HR can create requests.
  // Further refinement: PMs should ideally only be able to request for projects they manage.
  const allowedRoles = ["pm", "admin", "hr"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();

    const {
      projectId,
      requestedUserId,
      requestedRole,
      requestedPercentage,
      requestedStartDate,
      requestedEndDate,
      pmNotes,
    } = body;
    //Basic validation
    if (
      !projectId ||
      !requestedUserId ||
      !requestedRole ||
      requestedPercentage == null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Project ID, Requested User ID, Role, and Percentage are required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof requestedPercentage !== "number" ||
      requestedPercentage < 1 ||
      requestedPercentage > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Allocation percentage must be a number between 1 and 100.",
        },
        { status: 400 }
      );
    }

    //  Advanced Validation (Existence Checks & PM Authorization)
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found." },
        { status: 404 }
      );
    }

    // Authorization: If user is a PM, check if they manage this project
    if (
      session.user.role === "pm" &&
      project.pmId?.toString() !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: You can only request resources for projects you manage.",
        },
        { status: 403 }
      );
    }

    const requestedUser = await User.findById(requestedUserId);
    if (!requestedUser) {
      return NextResponse.json(
        { success: false, error: "Requested user not found." },
        { status: 404 }
      );
    }

    // Check for existing pending/approved request for the same user on the same project
    // to avoid duplicates if desired. This is optional.
    const existingRequest = await ResourceRequest.findOne({
      projectId,
      requestedUserId,
      status: { $in: ["pending", "approved"] }, // Check against pending or already approved
    });

    if (existingRequest) {
      if (existingRequest.status === "approved") {
        return NextResponse.json(
          {
            success: false,
            error:
              "This user is already allocated or has an approved request for this project.",
          },
          { status: 409 } // Conflict
        );
      }
      return NextResponse.json(
        {
          success: false,
          error:
            "A pending request for this user on this project already exists.",
        },
        { status: 409 } // Conflict
      );
    }

    //  Create Resource Request
    const newResourceRequest = new ResourceRequest({
      projectId,
      requestedUserId,
      requestedByPmId: session.user.id,
      requestedRole,
      requestedPercentage,
      requestedStartDate: requestedStartDate || undefined,
      requestedEndDate: requestedEndDate || undefined,
      pmNotes: pmNotes || undefined,
      status: "pending",
    });

    await newResourceRequest.save();

    // TODO: Trigger notification to Admin/HR about the new pending request

    return NextResponse.json(
      { success: true, data: newResourceRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error creating resource request:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages.join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error creating resource request." },
      { status: 500 }
    );
  }
}
