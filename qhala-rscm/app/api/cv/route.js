import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";

// GET /api/cv?skill=...
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const skill = searchParams.get("skill") || undefined;

    const data = await convex.query(api.cvCache.getAll, { 
      email,
      skill 
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch CV cache.", 400);
  }
}

// POST /api/cv (upload CV)
export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.cvCache.uploadCV, {
      email,
      ...body,
    });

    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error.message || "Unable to upload CV.", 400);
  }
}