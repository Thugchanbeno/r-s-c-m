import { convex, api } from "@/lib/convexServer";
import { NextResponse } from "next/server";

// GET /api/resourcerequests/report?status=...&pmId=...&department=...&function=...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const pmId = searchParams.get("pmId") || undefined;
    const department = searchParams.get("department") || undefined;
    const func = searchParams.get("function") || undefined;

    const data = await convex.query(api.resourceRequests.getReport, {
      status,
      pmId,
      department,
      function: func,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to fetch resource request report." },
      { status: 400 }
    );
  }
}