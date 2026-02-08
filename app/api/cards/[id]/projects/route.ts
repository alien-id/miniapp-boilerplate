import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { createProject } from "@/features/cards/queries";
import { CreateProjectRequest } from "@/features/cards/dto";
import { JwtErrors } from "@alien_org/auth-client";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const { sub } = await verifyToken(token);
    const { id: cardId } = await params;

    const body = await request.json();
    const parsed = CreateProjectRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const project = await createProject(cardId, sub, parsed.data);
    if (!project) {
      return NextResponse.json({ error: "Card not found or not owner" }, { status: 404 });
    }
    return NextResponse.json({
      data: {
        id: project.id,
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        linkUrl: project.linkUrl,
        createdAt: project.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("POST /api/cards/[id]/projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
