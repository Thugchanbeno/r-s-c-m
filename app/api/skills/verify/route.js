import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.skills.verifyUserSkill, {
      email,
      userSkillId: body.userSkillId,
      action: body.action, // "approve" or "reject"
      reason: body.reason,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to verify skill.", 400);
  }
}