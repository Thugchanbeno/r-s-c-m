import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// GET /api/projects/[projectId]/feedback
export async function GET(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const feedbackType = searchParams.get("feedbackType") || undefined;
    const includeAnonymous = searchParams.get("includeAnonymous") === "true";

    const data = await convex.query(api.projectFeedback.getByProject, {
      email,
      projectId: params.projectId,
      feedbackType,
      includeAnonymous,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch project feedback.", 400);
  }
}

// POST /api/projects/[projectId]/feedback
export async function POST(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const id = await convex.mutation(api.projectFeedback.create, {
      email,
      projectId: params.projectId,
      ...body,
    });

    return successResponse({ id }, 201);
  } catch (error) {
    return errorResponse(error.message || "Unable to submit feedback.", 400);
  }
}