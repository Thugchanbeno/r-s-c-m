// app/api/ai/extract-skills/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { description } = body;

    // Call Python Backend
    const response = await fetch(`${PYTHON_API_URL}/nlp/analyze-project-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
    });

    if (!response.ok) {
      throw new Error(`Python API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Return in the format frontend expects
    return NextResponse.json({
      extractedSkills: result.extractedSkills,
    });
  } catch (error) {
    console.error("Proxy error /api/ai/extract-skills:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
