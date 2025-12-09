import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

// GET /api/cv?skill=...
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const skill = searchParams.get("skill") || undefined;

    const data = await convex.query(api.cvCache.getAll, { 
      email,
      skill 
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch CV cache.", 400);
  }
}