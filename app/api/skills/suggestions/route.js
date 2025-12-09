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
    const suggestions = await convex.mutation(api.skills.getSuggestions, {
      email,
      description: body.description,
    });

    return successResponse({ data: suggestions });
  } catch (error) {
    return errorResponse(error.message || "Unable to get skill suggestions.", 400);
  }
}