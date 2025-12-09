import { convex, api } from "@/lib/convexServer";
import { NextResponse } from "next/server";
import { handleConvexError } from "@/convex/errorHandler";

export async function GET(_req, { params }) {
  try {
    const project = await convex.query(api.projects.getById, {
      id: params.projectId,
    });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    const parsed = handleConvexError(error);
    return NextResponse.json(
      { success: false, error: parsed.message, code: parsed.code, field: parsed.field },
      { status: 400 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const result = await convex.mutation(api.projects.update, {
      id: params.projectId,
      ...body,
    });
    return NextResponse.json(result);
  } catch (error) {
    const parsed = handleConvexError(error);
    return NextResponse.json(
      { success: false, error: parsed.message, code: parsed.code, field: parsed.field },
      { status: 400 }
    );
  }
}
