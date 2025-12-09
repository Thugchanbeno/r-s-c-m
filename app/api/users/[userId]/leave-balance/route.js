import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function GET(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const balance = await convex.query(api.workRequests.getLeaveBalance, {
      email,
      userId: params.userId,
    });
    
    return successResponse({ data: balance });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch leave balance", 400);
  }
}