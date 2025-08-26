import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse
} from "@/lib/auth-utils";

// GET /api/skills
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const skills = await convex.query(api.skills.getAll, { 
      email,
      category, 
      search 
    });

    return successResponse({ count: skills.length, data: skills });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch skills.", 400);
  }
}

// POST /api/skills
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
    return errorResponse(error.message || "Unable to create skill.", 400);
  }
}