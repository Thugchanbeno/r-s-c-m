import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

// PUT /api/allocations/[allocationId]
export async function PUT(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    await convex.mutation(api.allocations.update, {
      email,
      id: params.allocationId,
      ...body,
    });

    return successResponse({ message: "Allocation updated successfully." });
  } catch (error) {
    return errorResponse(error.message || "Unable to update allocation.", 400);
  }
}

// DELETE /api/allocations/[allocationId]
export async function DELETE(_req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    await convex.mutation(api.allocations.remove, { 
      email,
      id: params.allocationId 
    });

    return successResponse({ message: "Allocation deleted successfully." });
  } catch (error) {
    return errorResponse(error.message || "Unable to delete allocation.", 400);
  }
}