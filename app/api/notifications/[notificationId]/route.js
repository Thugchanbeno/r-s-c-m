import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

// PUT /api/notifications/[notificationId]
export async function PUT(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.notifications.update, {
      email,
      id: params.notificationId,
      ...body,
    });

    return successResponse({ message: "Notification updated successfully" });
  } catch (error) {
    return errorResponse(error.message || "Unable to update notification.", 400);
  }
}