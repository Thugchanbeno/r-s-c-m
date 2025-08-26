import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

export async function GET(_req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const task = await convex.query(api.tasks.getById, {
      email,
      id: params.taskId,
    });

    return successResponse({ data: task });
  } catch (error) {
    return errorResponse(error.message || "Unable to fetch task.", 400);
  }
}

export async function PUT(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.tasks.update, {
      email,
      id: params.taskId,
      ...body,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to update task.", 400);
  }
}

export async function DELETE(_req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const result = await convex.mutation(api.tasks.remove, {
      email,
      id: params.taskId,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to delete task.", 400);
  }
}