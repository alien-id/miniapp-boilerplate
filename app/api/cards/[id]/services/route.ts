import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { createService } from "@/features/cards/queries";
import { CreateServiceRequest } from "@/features/cards/dto";
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
    const parsed = CreateServiceRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const service = await createService(cardId, sub, parsed.data);
    if (!service) {
      return NextResponse.json({ error: "Card not found or not owner" }, { status: 404 });
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
    console.error("POST /api/cards/[id]/services:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
