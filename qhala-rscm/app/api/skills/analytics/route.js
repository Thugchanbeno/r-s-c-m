import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId") || undefined;
    const category = searchParams.get("category") || undefined;

    const data = await convex.query(api.skills.getSkillAnalytics, {
      email,
      skillId,
      category,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch skill analytics.", 400);
  }
}