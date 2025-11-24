// app/api/ai/extract-skills/route.js
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
    const { description, projectId } = body;

    const result = await fetchAction(
      api.projects.extractSkillsFromDescription,
      {
        email: session.user.email,
        projectId: projectId || null,
        description,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Proxy error /api/ai/extract-skills:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
