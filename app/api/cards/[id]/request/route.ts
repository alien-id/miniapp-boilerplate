import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { findCardById, createReviewRequest } from "@/features/cards/queries";
import { CreateReviewRequestRequest } from "@/features/cards/dto";
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

    const card = await findCardById(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    if (card.alienId !== sub) {
      return NextResponse.json({ error: "Not your card" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = CreateReviewRequestRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const req = await createReviewRequest(cardId, parsed.data);
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const reviewLink = `${baseUrl}/card/${cardId}/review?request=${req.id}`;

    return NextResponse.json({
      data: {
        id: req.id,
        cardId: req.cardId,
        paymentAmount: req.paymentAmount,
        note: req.note,
        reviewLink,
        createdAt: req.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("POST /api/cards/[id]/request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
