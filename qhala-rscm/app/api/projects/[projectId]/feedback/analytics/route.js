import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// GET /api/projects/[projectId]/feedback/analytics
export async function GET(_req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const data = await convex.query(api.projectFeedback.getProjectAnalytics, {
      email,
      projectId: params.projectId,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch feedback analytics.", 400);
  }
}