import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const requestType = searchParams.get("requestType") || undefined;
    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const skip = Number(searchParams.get("skip") || 0);
    const limit = Number(searchParams.get("limit") || 50);

    const data = await convex.query(api.workRequests.getAll, {
      email,
      requestType,
      status,
      userId,
      skip,
      limit,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch work requests.", 400);
  }
}