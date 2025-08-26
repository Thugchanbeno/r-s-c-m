import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail, 
  unauthorizedResponse, 
  successResponse, 
  errorResponse 
} from "@/lib/auth-utils";

export async function POST(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.skills.uploadProofDocument, {
      email,
      userSkillId: params.userSkillId,
      fileName: body.fileName,
      proofType: body.proofType,
      issuer: body.issuer,
      documentStorageId: body.documentStorageId,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to upload proof document.", 400);
  }
}

export async function DELETE(req, { params }) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    const result = await convex.mutation(api.skills.removeProofDocument, {
      email,
      userSkillId: params.userSkillId,
      documentStorageId: body.documentStorageId,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Unable to remove proof document.", 400);
  }
}