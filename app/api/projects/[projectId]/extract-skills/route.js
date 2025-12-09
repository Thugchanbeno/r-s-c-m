import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// POST /api/projects/[projectId]/extract-skills
export async function POST(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.projects.extractSkillsFromDescription, {
      email,
      projectId: params.projectId,
      description: body.description,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to extract skills.", 400);
  }
}