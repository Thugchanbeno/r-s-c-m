import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

// PUT /api/notifications/preferences
export async function PUT(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.notifications.updatePreferences, {
      email,
      ...body,
    });

    return successResponse({ message: "Preferences updated successfully" });
  } catch (error) {
    return errorResponse(error.message || "Unable to update preferences.", 400);
  }
}