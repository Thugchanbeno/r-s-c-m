import { convex, api } from "@/lib/convexServer";
import {
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

export async function PUT(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.events.updateEvent, {
      email,
      eventId: params.eventId,
      ...body,
    });

    return successResponse({ message: "Event updated successfully" });
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}

export async function DELETE(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    await convex.mutation(api.events.deleteEvent, {
      email,
      eventId: params.eventId,
    });

    return successResponse({ message: "Event deleted successfully" });
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
