import { convex, api } from "@/lib/convexServer";
import { 
  getAuthenticatedEmail,
  unauthorizedResponse,
  successResponse,
  errorResponse
} from "@/lib/auth-utils";
import { handleConvexError } from "@/convex/errorHandler";

// GET /api/skills
export async function GET(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const skills = await convex.query(api.skills.getAll, { 
      category, 
      search 
    });

    return successResponse({ count: skills.length, data: skills });
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}

export async function POST(req) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) return unauthorizedResponse();

    const body = await req.json();
    console.log("[Skills POST] Creating skill:", body.name);
    
    const id = await convex.mutation(api.skills.create, { 
      email,
      ...body 
    });
    console.log("[Skills POST] Skill created with ID:", id);

    const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("[Skills POST] Python API URL:", pythonApiUrl);
    
    if (pythonApiUrl && id) {
      console.log("[Skills POST] Triggering populate for skill:", id, body.name);
      try {
        const populateUrl = `${pythonApiUrl}/skills/populate`;
        const response = await fetch(populateUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillId: id,
            skillName: body.name,
            description: body.description,
          }),
        });
        console.log("[Skills POST] Populate response status:", response.status);
        if (!response.ok) {
          const text = await response.text();
          console.error("[Skills POST] Populate error:", response.status, text);
        } else {
          console.log("[Skills POST] Populate succeeded");
        }
      } catch (populateError) {
        console.error("[Skills POST] Populate fetch failed:", populateError.message);
      }
    } else {
      console.log("[Skills POST] Skipping populate - pythonApiUrl:", !!pythonApiUrl, "id:", !!id);
    }

    return successResponse({ id }, 201);
  } catch (error) {
    const parsed = handleConvexError(error);
    return errorResponse(parsed.message, 400, parsed.code, parsed.field);
  }
}
