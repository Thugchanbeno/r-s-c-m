import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

export async function GET(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assignedUserId = searchParams.get("assignedUserId") || undefined;
    const skip = Number(searchParams.get("skip") || 0);
    const limit = Number(searchParams.get("limit") || 50);

    const data = await convex.query(api.tasks.getAll, {
      email,
      projectId: params.projectId,
      assignedUserId,
      status,
      priority,
      skip,
      limit,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch project tasks.", 400);
  }
}