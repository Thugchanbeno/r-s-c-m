// app/api/cv/extract-entities/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import CvCache from "@/models/CvCache";
import connectDB from "@/lib/db";

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
    const { text, fileName, cacheResult } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Text is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    const nlpServiceUrl = `${
      process.env.NLP_API_URL || "http://localhost:8000"
    }/nlp/extract-entities`;

    const nlpPayload = { text };

    const nlpResponse = await fetch(nlpServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nlpPayload),
    });

    const nlpResult = await nlpResponse.json();

    if (!nlpResponse.ok) {
      console.error("NLP service error:", {
        status: nlpResponse.status,
        error: nlpResult.detail || nlpResult.error || "Unknown error",
      });
      return NextResponse.json(
        {
          success: false,
          error:
            nlpResult.detail || nlpResult.error || "NLP service request failed",
        },
        { status: nlpResponse.status }
      );
    }

    if (cacheResult && fileName) {
      try {
        await connectDB();

        const cacheData = {
          fileName,
          rawText: text,
          extractedEntities: nlpResult,
          extractedSkills: nlpResult.skills || [],
          prepopulatedData: {
            name: nlpResult.personal_info?.name || null,
            email: nlpResult.personal_info?.email || null,
            phone: nlpResult.personal_info?.phone || null,
            skills: nlpResult.skills || [],
            experience: nlpResult.experience || [],
            education: nlpResult.education || [],
          },
        };

        await CvCache.create(cacheData);
      } catch (cacheError) {
        console.error("Failed to save CV to cache:", {
          error: cacheError.message,
          fileName,
        });
      }
    }

    const responseData = {
      success: true,
      data: nlpResult,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("CV Entity Extraction API Error:", {
      message: error.message,
      name: error.name,
    });

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
