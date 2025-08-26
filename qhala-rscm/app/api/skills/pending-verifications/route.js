import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

export async function GET() {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const data = await convex.query(api.skills.getPendingVerifications, { email });
    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch pending verifications.", 400);
  }
}