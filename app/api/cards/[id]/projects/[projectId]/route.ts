import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { updateProject, deleteProject } from "@/features/cards/queries";
import { UpdateProjectRequest } from "@/features/cards/dto";
import { JwtErrors } from "@alien_org/auth-client";

type Params = { params: Promise<{ id: string; projectId: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const { sub } = await verifyToken(token);
    const { id: cardId, projectId } = await params;

    const body = await request.json();
    const parsed = UpdateProjectRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const project = await updateProject(projectId, cardId, sub, parsed.data);
    if (!project) {
      return NextResponse.json({ error: "Project not found or not owner" }, { status: 404 });
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
    console.error("PUT /api/cards/[id]/projects/[projectId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const { sub } = await verifyToken(token);
    const { id: cardId, projectId } = await params;

    const ok = await deleteProject(projectId, cardId, sub);
    if (!ok) {
      return NextResponse.json({ error: "Project not found or not owner" }, { status: 404 });
    }
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    if (error instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("DELETE /api/cards/[id]/projects/[projectId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
