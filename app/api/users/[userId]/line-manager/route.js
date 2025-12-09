import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function POST(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.users.assignLineManager, {
      email,
      userId: params.userId,
      lineManagerId: body.lineManagerId,
    });
    
    return successResponse({ message: "Line manager assigned successfully" });
  } catch (error) {
    return errorResponse(error.message || "Unable to assign line manager", 400);
  }
}