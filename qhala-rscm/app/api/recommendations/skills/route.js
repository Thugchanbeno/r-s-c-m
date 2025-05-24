import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const allowedRoles = ["pm", "hr", "admin"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { description } = body;

    if (
      !description ||
      typeof description !== "string" ||
      description.trim() === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Description is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    // This URL should point to your FastAPI instance and the /extract-skills endpoint
    const nlpServiceUrl = `${
      process.env.NLP_API_URL || "http://localhost:8000"
    }/extract-skills`;

    console.log(
      `Next.js API (/api/nlp/extract-from-text): Proxying to NLP service: ${nlpServiceUrl} for description: "${description.substring(
        0,
        50
      )}..."`
    );

    const nlpResponse = await fetch(nlpServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any auth headers if your FastAPI is protected
      },
      body: JSON.stringify({ text: description }), // FastAPI /extract-skills expects {"text": "..."}
    });

    const nlpResult = await nlpResponse.json();

    if (!nlpResponse.ok) {
      console.error(
        `FastAPI /extract-skills error (Status: ${nlpResponse.status}):`,
        nlpResult
      );
      return NextResponse.json(
        {
          success: false,
          error:
            nlpResult.detail || nlpResult.error || "NLP service request failed",
          details: nlpResult,
        },
        { status: nlpResponse.status }
      );
    }

    if (nlpResult && typeof nlpResult.extracted_skills !== "undefined") {
      if (!Array.isArray(nlpResult.extracted_skills)) {
        console.error(
          "FastAPI /extract-skills 'extracted_skills' field was not an array:",
          nlpResult.extracted_skills
        );
        return NextResponse.json(
          {
            success: false,
            error: "Invalid skill data format from NLP service (not an array).",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        data: nlpResult.extracted_skills,
      });
    } else {
      console.error(
        "FastAPI /extract-skills response did not contain 'extracted_skills' key or was invalid:",
        nlpResult
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing skill data from NLP service.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Next.js API Error in /api/nlp/extract-from-text:", error);
    if (error.cause && error.cause.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not connect to the NLP service. Please try again later.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server error processing NLP request." },
      { status: 500 }
    );
  }
}
