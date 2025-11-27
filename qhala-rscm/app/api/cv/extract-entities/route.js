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
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pythonFormData = new FormData();
    pythonFormData.append("file", file);
    if (userId) pythonFormData.append("userId", userId);

    const response = await fetch(`${PYTHON_API_URL}/skills/extract-from-cv`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python API error: ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
