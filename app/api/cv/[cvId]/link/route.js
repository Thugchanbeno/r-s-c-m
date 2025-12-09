import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// POST /api/cv/[cvId]/link
export async function POST(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.cvCache.linkToUser, {
      email,
      cvId: params.cvId,
      userId: body.userId,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to link CV skills to user.", 400);
  }
}