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
    const args = {
      email: session.user.email,
      description,
    };

    if (projectId) {
      args.projectId = projectId;
    }

    const result = await fetchAction(
      api.projects.extractSkillsFromDescription,
      args
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Proxy error /api/ai/extract-skills:", error);

    const errorMessage = error.data?.message || error.message || "Server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
