import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

// GET /api/userskills
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("countOnly") === "true";

    const data = await convex.query(api.userSkills.getForCurrentUser, {
      email,
      countOnly,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch user skills.", 400);
  }
}

// PUT /api/userskills
export async function PUT(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const data = await convex.mutation(api.userSkills.updateForCurrentUser, {
      email,
      ...body,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to update user skills.", 400);
  }
}