import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

export async function GET(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const user = await convex.query(api.users.getById, { 
      id: params.userId 
    });
    
    if (!user) {
      return errorResponse("User not found", 404, "NOT_FOUND");
    }
    
    return successResponse({ data: user });
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}

export async function PUT(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.users.updateProfile, { 
      email,
      id: params.userId, 
      ...body 
    });
    
    return successResponse({ message: "User updated successfully" });
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
