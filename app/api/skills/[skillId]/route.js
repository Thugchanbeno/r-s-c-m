import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

export async function DELETE(_req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const result = await convex.mutation(api.skills.deleteSkill, {
      email,
      skillId: params.skillId,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to delete skill.", 400);
  }
}