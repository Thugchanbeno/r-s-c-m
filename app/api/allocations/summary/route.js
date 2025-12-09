import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

// GET /api/allocations/summary?scope=overall
// GET /api/allocations/summary?scope=department&department=Engineering
// GET /api/allocations/summary?scope=function&function=q-trust
// GET /api/allocations/summary?pmId=<userId>
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || undefined;
    const pmId = searchParams.get("pmId") || undefined;
    const department = searchParams.get("department") || undefined;
    const func = searchParams.get("function") || undefined;

    const data = await convex.query(api.allocations.getSummary, {
      email,
      scope,
      pmId,
      department,
      function: func,
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch allocation summary.", 400);
  }
}