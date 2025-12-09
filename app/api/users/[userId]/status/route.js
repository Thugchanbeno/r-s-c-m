import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function PATCH(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.users.updateStatus, {
      email,
      id: params.userId,
      availabilityStatus: body.availabilityStatus,
    });
    
    return successResponse({ message: "Status updated successfully" });
  } catch (error) {
    return errorResponse(error.message || "Unable to update status", 400);
  }
}