import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const assignedUserId = searchParams.get("assignedUserId") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const skip = Number(searchParams.get("skip") || 0);
    const limit = Number(searchParams.get("limit") || 50);

    const data = await convex.query(api.tasks.getAll, {
      email,
      projectId,
      assignedUserId,
      status,
      priority,
      skip,
      limit,
    });

    return successResponse({ data });
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
    const id = await convex.mutation(api.tasks.create, {
      email,
      ...body,
    });

    return successResponse({ id }, 201);
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
