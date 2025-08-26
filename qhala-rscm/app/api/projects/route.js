import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// GET /api/projects
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const pmId = searchParams.get("pmId") || undefined;
    const countOnly = searchParams.get("countOnly") === "true";
    const function_ = searchParams.get("function") || undefined;
    const department = searchParams.get("department") || undefined;
    const includeUtilization = searchParams.get("includeUtilization") === "true";

    let data;
    if (function_ || department) {
      data = await convex.query(api.projects.getByOrganization, {
        email,
        function: function_,
        department,
        includeUtilization,
      });
    } else {
      data = await convex.query(api.projects.getAll, {
        email,
        pmId,
        countOnly,
      });
    }

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch projects.", 400);
  }
}

// POST /api/projects
export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const id = await convex.mutation(api.projects.create, {
      email,
      ...body,
    });

    return successResponse({ id }, 201);
  } catch (error) {
    return errorResponse(error.message || "Unable to create project.", 400);
  }
}