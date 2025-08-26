import { convex, api } from "@/lib/convexServer";
import { successResponse, errorResponse } from "@/lib/auth-utils";

export async function POST(req) {
  try {
    const body = await req.json();
    const id = await convex.mutation(api.users.selfOnboard, body);
    return successResponse({ id }, 201);
  } catch (error) {
    return errorResponse(error.message || "Unable to onboard user", 400);
  }
}