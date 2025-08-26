import { convex, api } from "@/lib/convexServer";
import { getAuthenticatedEmail, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-utils";

export async function GET(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const user = await convex.query(api.users.getById, { 
      email,
      id: params.userId 
    });
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    return successResponse({ data: user });
  } catch (error) {
    return errorResponse(error.message || "Failed to fetch user");
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
    return errorResponse(error.message || "Failed to update user");
  }
}