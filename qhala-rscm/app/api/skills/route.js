import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse
} from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

// GET /api/skills
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const skills = await convex.query(api.skills.getAll, { 
      category, 
      search 
    });

    return successResponse({ count: skills.length, data: skills });
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
    const id = await convex.mutation(api.skills.create, { 
      email,
      ...body 
    });

    return successResponse({ id }, 201);
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
