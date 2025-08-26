import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// GET /api/projects/organization
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const function_ = searchParams.get("function") || undefined;
    const department = searchParams.get("department") || undefined;
    const includeUtilization = searchParams.get("includeUtilization") === "true";

    const data = await convex.query(api.projects.getByOrganization, {
      email,
      function: function_,
      department,
      includeUtilization,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch organizational projects.", 400);
  }
}