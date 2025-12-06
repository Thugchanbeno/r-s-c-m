import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const days = Number(searchParams.get("days") || 7);

    if (!userId) {
      return errorResponse("userId parameter is required", 400);
    }

    const data = await convex.query(api.events.getByUser, {
      email,
      userId,
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
    const eventId = await convex.mutation(api.events.createEvent, {
      email,
      ...body,
    });

    return successResponse({ id: eventId }, 201);
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
