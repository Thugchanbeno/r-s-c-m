import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, projectId, recommendationType, rating, comments } = body;

    const result = await fetchAction(api.api.submitFeedback, {
      userId,
      projectId,
      recommendationType,
      rating: rating ? 1 : 0,
      comments,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Proxy error /api/feedback:", error);
    const errorMessage = error.message || "Server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
