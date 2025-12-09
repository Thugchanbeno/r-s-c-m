import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse 
} from "@/lib/auth-utils";

// GET /api/notifications/count
export async function GET() {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const result = await convex.query(api.notifications.getUnreadCount, { email });
    return successResponse(result);
  } catch {
    // fallback: return 0 if error
    return successResponse({ count: 0 });
  }
}