import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

// GET /api/allocations?userId=...&projectId=...&page=1&limit=10
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const data = await convex.query(api.allocations.getAll, {
      email,
      userId,
      projectId,
      page,
      limit,
    });

    return successResponse(data);
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}

export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const id = await convex.mutation(api.allocations.create, {
      email,
      ...body,
    });

    return successResponse({ id }, 201);
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
