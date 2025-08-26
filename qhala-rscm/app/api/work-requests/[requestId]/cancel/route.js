import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function POST(_req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    await convex.mutation(api.workRequests.cancelRequest, {
      email,
      requestId: params.requestId,
    });

    return successResponse({ message: "Request cancelled successfully." });
  } catch (error) {
    return errorResponse(error.message || "Unable to cancel request.", 400);
  }
}