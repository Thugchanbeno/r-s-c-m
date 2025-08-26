import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const id = await convex.mutation(api.workRequests.createOvertimeRequest, {
      email,
      ...body,
    });

    return successResponse({ id }, 201);
  } catch (error) {
    return errorResponse(error.message || "Unable to create overtime request.", 400);
  }
}