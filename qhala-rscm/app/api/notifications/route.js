import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

// GET /api/notifications
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";
    const dateRange = searchParams.get("dateRange") || "all";

    const data = await convex.query(api.notifications.getAll, {
      email,
      page,
      limit,
      status,
      type,
      search,
      dateRange,
    });

    return successResponse(data);
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch notifications.", 400);
  }
}

// POST /api/notifications (mark as read)
export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.notifications.markAsRead, {
      email,
      ...body,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to mark notifications as read.", 400);
  }
}

// DELETE /api/notifications
export async function DELETE(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.notifications.remove, {
      email,
      ...body,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to delete notifications.", 400);
  }
}