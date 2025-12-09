import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const skillName = searchParams.get("skillName") || undefined;
    const countOnly = searchParams.get("countOnly") === "true";
    const skip = Number(searchParams.get("skip") || 0);
    const limit = Number(searchParams.get("limit") || 50);

    const data = await convex.query(api.users.getAll, {
      email,
      search,
      skillName,
      countOnly,
      skip,
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
    const id = await convex.mutation(api.users.create, {
      email,
      ...body,
    });
    
    return successResponse({ id }, 201);
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
