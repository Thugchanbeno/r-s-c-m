import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const limitParam = searchParams.get("limit") || "10";

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return NextResponse.json(
      { success: false, error: "Valid Project ID is required." },
      { status: 400 }
    );
  }

  const limit = parseInt(limitParam, 10);
  if (isNaN(limit) || limit <= 0) {
    return NextResponse.json(
      { success: false, error: "Limit must be a positive integer." },
      { status: 400 }
    );
  }

  // Your FastAPI endpoint for user recommendations
  const FASTAPI_RECOMMENDER_URL = `${
    process.env.NLP_API_URL || "http://localhost:8000"
  }/recommend/users-for-project`;

  try {
    console.log(
      `Next.js API (/api/recommendations/users): Forwarding recommendation request for project ${projectId} (limit: ${limit}) to ${FASTAPI_RECOMMENDER_URL}`
    );

    const fastApiResponse = await fetch(FASTAPI_RECOMMENDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any necessary auth headers if your FastAPI is protected
      },
      body: JSON.stringify({
        id: projectId, // FastAPI expects "id" for project_id
        limit: limit,
      }),
    });

    const fastApiResult = await fastApiResponse.json();

    if (!fastApiResponse.ok) {
      console.error(
        `FastAPI recommender error for project ${projectId} (Status: ${fastApiResponse.status}):`,
        fastApiResult
      );
      return NextResponse.json(
        {
          success: false,
          error:
            fastApiResult.detail ||
            fastApiResult.error ||
            "Failed to get recommendations from FastAPI service.",
          details: fastApiResult, // Send full FastAPI error details if available
        },
        { status: fastApiResponse.status }
      );
    }

    // FastAPI returns {"recommendations": [...]}
    // We want to return the array directly under a "data" key for consistency
    // or handle if "recommendations" key is missing.
    if (fastApiResult && typeof fastApiResult.recommendations !== "undefined") {
      if (!Array.isArray(fastApiResult.recommendations)) {
        console.error(
          "FastAPI response 'recommendations' field was not an array:",
          fastApiResult.recommendations
        );
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid recommendation data format from service (not an array).",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        data: fastApiResult.recommendations,
      });
    } else {
      console.error(
        "FastAPI response did not contain 'recommendations' key or was invalid:",
        fastApiResult
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing recommendation data from service.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      `Next.js API Error in /api/recommendations/users for project ${projectId}:`,
      error
    );
    // Check if it's a fetch error (e.g., FastAPI server down)
    if (error.cause && error.cause.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not connect to the recommendation service. Please try again later.",
        },
        { status: 503 } // Service Unavailable
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Server error while fetching recommendations.",
      },
      { status: 500 }
    );
  }
}
