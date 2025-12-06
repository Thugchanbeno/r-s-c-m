import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

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
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}

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
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
