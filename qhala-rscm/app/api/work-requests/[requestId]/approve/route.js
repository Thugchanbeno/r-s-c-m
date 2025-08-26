import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function POST(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.workRequests.processApproval, {
      email,
      requestId: params.requestId,
      action: body.action, // "approve" or "reject"
      reason: body.reason,
    });

    return successResponse({ message: "Request processed successfully." });
  } catch (error) {
    return errorResponse(error.message || "Unable to process approval.", 400);
  }
}