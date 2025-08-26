import { convex, api } from "@/lib/convexServer";
import { NextResponse } from "next/server";

// PUT /api/resourcerequests/[requestId]
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const result = await convex.mutation(api.resourceRequests.processApproval, {
      requestId: params.requestId,
      ...body,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to process resource request." },
      { status: 400 }
    );
  }
}