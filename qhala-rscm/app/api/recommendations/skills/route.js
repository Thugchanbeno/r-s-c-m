import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import CvCache from "@/models/CvCache";

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
    const { description, fileName, cacheResult } = body;

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

    const nlpServiceUrl = `${
      process.env.NLP_API_URL || "http://localhost:8000"
    }/extract-skills`;

    const nlpResponse = await fetch(nlpServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
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
        },
        { status: nlpResponse.status }
      );
    }

    const extractedSkills = nlpResult.extracted_skills || [];

    if (cacheResult && fileName) {
      try {
        await connectDB();
        await CvCache.create({
          fileName,
          rawText: description,
          extractedSkills: extractedSkills,
        });
        console.log(`Successfully cached CV: ${fileName}`);
      } catch (cacheError) {
        console.error("Failed to save CV to cache:", cacheError);
      }
    }

    return NextResponse.json({
      success: true,
      data: extractedSkills,
    });
  } catch (error) {
    console.error("Next.js API Error in /api/recommendations/skills:", error);
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
