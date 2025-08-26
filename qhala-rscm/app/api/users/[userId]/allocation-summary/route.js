import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function GET(req, context) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { userId } = await context.params;
    
    const summary = await convex.query(api.users.getSummary, {
      email,
      userId,
    });
    
    return successResponse({ data: summary });
  } catch (error) {
    return errorResponse(error.message || "Failed to fetch allocation summary");
  }
}