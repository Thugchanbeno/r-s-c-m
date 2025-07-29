// app/api/recommendations/users/route.js
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

  const FASTAPI_RECOMMENDER_URL = `${
    process.env.NLP_API_URL || "http://localhost:8000"
  }/recommend/users-for-project`;

  try {
    const fastApiResponse = await fetch(FASTAPI_RECOMMENDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: projectId,
        limit: limit,
      }),
    });

    const fastApiResult = await fastApiResponse.json();

    if (!fastApiResponse.ok) {
      console.error(
        `FastAPI recommender error for project ${projectId}:`,
        fastApiResult.detail || fastApiResult.error
      );
      return NextResponse.json(
        {
          success: false,
          error:
            fastApiResult.detail ||
            fastApiResult.error ||
            "Failed to get recommendations from FastAPI service.",
          details: fastApiResult,
        },
        { status: fastApiResponse.status }
      );
    }

    if (fastApiResult && typeof fastApiResult.recommendations !== "undefined") {
      if (!Array.isArray(fastApiResult.recommendations)) {
        console.error(
          "FastAPI response 'recommendations' field was not an array"
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
      console.error("FastAPI response missing 'recommendations' key");
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
      `Recommendations API Error for project ${projectId}:`,
      error.message
    );

    if (error.cause && error.cause.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not connect to the recommendation service. Please try again later.",
        },
        { status: 503 }
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
