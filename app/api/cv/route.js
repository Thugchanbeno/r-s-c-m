import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// POST /api/cv -> Calls Python /nlp/parse-cv (Stateless)
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const response = await fetch(`${PYTHON_API_URL}/nlp/parse-cv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Python API error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result); // Returns { extracted: ... }
  } catch (error) {
    console.error("Proxy error /api/cv:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
