import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { updateService, deleteService } from "@/features/cards/queries";
import { UpdateServiceRequest } from "@/features/cards/dto";
import { JwtErrors } from "@alien_org/auth-client";

type Params = { params: Promise<{ id: string; serviceId: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const { sub } = await verifyToken(token);
    const { id: cardId, serviceId } = await params;

    const body = await request.json();
    const parsed = UpdateServiceRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const service = await updateService(serviceId, cardId, sub, parsed.data);
    if (!service) {
      return NextResponse.json({ error: "Service not found or not owner" }, { status: 404 });
    }
    return NextResponse.json({
      data: {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        imageUrl: service.imageUrl,
        tags: service.tags,
        createdAt: service.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("PUT /api/cards/[id]/services/[serviceId]:", error);
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
    const { id: cardId, serviceId } = await params;

    const ok = await deleteService(serviceId, cardId, sub);
    if (!ok) {
      return NextResponse.json({ error: "Service not found or not owner" }, { status: 404 });
    }
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    if (error instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("DELETE /api/cards/[id]/services/[serviceId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
