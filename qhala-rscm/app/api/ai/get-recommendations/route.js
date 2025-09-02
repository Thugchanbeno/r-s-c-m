// app/api/ai/get-recommendations/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, limit = 10 } = body;

    const result = await fetchQuery(api.projects.getRecommendations, {
      email: session.user.email,
      projectId,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Proxy error /api/ai/get-recommendations:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
