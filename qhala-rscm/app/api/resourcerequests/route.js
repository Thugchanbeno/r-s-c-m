import { convex, api } from "@/lib/convexServer";
import { NextResponse } from "next/server";
import { handleConvexError } from "@/convex/errorHandler";

// GET /api/resourcerequests
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const requestedByPmId = searchParams.get("requestedByPmId") || undefined;
    const countOnly = searchParams.get("countOnly") === "true";

    const data = await convex.query(api.resourceRequests.getAll, {
      status,
      requestedByPmId,
      countOnly,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const parsed = handleConvexError(error);
    return NextResponse.json(
      { success: false, error: parsed.message, code: parsed.code, field: parsed.field },
      { status: 400 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const id = await convex.mutation(api.resourceRequests.create, body);
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    const parsed = handleConvexError(error);
    return NextResponse.json(
      { success: false, error: parsed.message, code: parsed.code, field: parsed.field },
      { status: 400 }
    );
  }
}
