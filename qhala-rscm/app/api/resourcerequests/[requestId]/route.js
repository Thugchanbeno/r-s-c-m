import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import ResourceRequest from "@/models/ResourceRequest";
import Allocation from "@/models/Allocation";
import User from "@/models/User";
import Project from "@/models/Project";
import Notifications from "@/models/Notifications";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = params;

  // Authorization: Only Admins and HR can process requests
  const allowedRoles = ["admin", "hr"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return NextResponse.json(
      { success: false, error: "Invalid Request ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    const { status, approverNotes } = body; // Expecting 'approved' or 'rejected'

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status provided." },
        { status: 400 }
      );
    }

    const resourceRequest = await ResourceRequest.findById(requestId);

    if (!resourceRequest) {
      return NextResponse.json(
        { success: false, error: "Resource request not found." },
        { status: 404 }
      );
    }

    if (resourceRequest.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Request already processed with status: ${resourceRequest.status}.`,
        },
        { status: 409 }
      );
    }
    // Update the request
    resourceRequest.status = status;
    resourceRequest.approvedBy = session.user.id;
    resourceRequest.processedAt = new Date();
    if (approverNotes) {
      resourceRequest.approverNotes = approverNotes;
    }

    let newAllocation = null;

    // If approved, create an Allocation record
    if (status === "approved") {
      // Check if an active allocation for this user on this project already exists
      // to prevent accidental double allocation from multiple approved requests.
      // This check might need refinement based on how you want to handle updates vs. new.
      const existingAllocation = await Allocation.findOne({
        userId: resourceRequest.requestedUserId,
        projectId: resourceRequest.projectId,
        // Add date checks if you want to prevent overlapping active allocations
        // For now, this prevents any duplicate active or future allocation.
        // $or: [
        //   { endDate: null },
        //   { endDate: { $gte: new Date() } }
        // ]
      });

      if (existingAllocation) {
        // Instead of erroring, you might want to update the existing allocation
        // or inform the admin. For now, let's prevent a new one if one exists.
        // Or, if the request had specific dates, this logic might differ.
        console.warn(
          `User ${resourceRequest.requestedUserId} already has an allocation for project ${resourceRequest.projectId}. Not creating a new one from this request.`
        );
        // Potentially update the resourceRequest status to 'approved_duplicate' or similar
        // For now, we'll proceed to save the request status but not create a new allocation.
      } else {
        newAllocation = new Allocation({
          userId: resourceRequest.requestedUserId,
          projectId: resourceRequest.projectId,
          allocationPercentage: resourceRequest.requestedPercentage,
          startDate: resourceRequest.requestedStartDate || new Date(),
          endDate: resourceRequest.requestedEndDate || null,
          role: resourceRequest.requestedRole,
        });
        await newAllocation.save();
      }
    }
    await resourceRequest.save();
    //trigger notifications
    const projectForNotif = await Project.findById(
      resourceRequest.projectId
    ).select("name");
    const userForNotif = await User.findById(
      resourceRequest.requestedUserId
    ).select("name");
    const pmWhoRequested = await User.findById(
      resourceRequest.requestedByPmId
    ).select("name");

    let pmMessage = "";
    let userMessage = "";
    const projectLink = `/projects/${resourceRequest.projectId}`;

    if (resourceRequest.status === "approved") {
      pmMessage = `Your request for ${
        userForNotif?.name || "a user"
      } on project '${projectForNotif?.name || "N/A"}' has been approved.`;
      if (newAllocation) {
        // Only notify user if allocation was successfully created
        userMessage = `You have been allocated to project '${
          projectForNotif?.name || "N/A"
        }' as ${newAllocation.role} at ${newAllocation.allocationPercentage}%.`;
        await Notifications.create({
          userId: resourceRequest.requestedUserId,
          message: userMessage,
          link: projectLink,
          type: "request_approved",
          relatedResource: newAllocation._id,
          onModel: "Allocation",
        });
      }
    } else if (resourceRequest.status === "rejected") {
      pmMessage = `Your request for ${
        userForNotif?.name || "a user"
      } on project '${projectForNotif?.name || "N/A"}' has been rejected.`;
      if (resourceRequest.approverNotes) {
        pmMessage += ` Notes: ${resourceRequest.approverNotes}`;
      }
    }

    if (pmMessage) {
      await Notifications.create({
        userId: resourceRequest.requestedByPmId,
        message: pmMessage,
        link: projectLink,
        type:
          resourceRequest.status === "approved"
            ? "request_approved"
            : "request_rejected",
        relatedResource: resourceRequest._id,
        onModel: "ResourceRequest",
      });
    }

    return NextResponse.json({
      success: true,
      data: resourceRequest,
      ...(newAllocation && { allocation: newAllocation }),
    });
  } catch (error) {
    console.error(`API Error processing resource request ${requestId}:`, error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { success: false, error: messages.join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server Error processing resource request." },
      { status: 500 }
    );
  }
}
