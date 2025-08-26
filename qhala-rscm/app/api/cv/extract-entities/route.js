import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// POST /api/cv/extract-entities
export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.action(api.cvCache.extractEntities, {
      email,
      ...body,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Entity extraction failed.", 400);
  }
}