import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import {
  findCardById,
  findReviewRequestById,
  createReview,
  getReviewsByCardId,
} from "@/features/cards/queries";
import { CreateReviewRequest } from "@/features/cards/dto";
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

    const body = await request.json();
    const parsed = CreateReviewRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { relationship, rating, text, isAnonymous, reviewerName, requestId } = parsed.data;

    let paymentAmount = 0;
    if (requestId) {
      const req = await findReviewRequestById(requestId, cardId);
      if (req) paymentAmount = req.paymentAmount ?? 0;
    }

    const review = await createReview({
      cardId,
      reviewerAlienId: sub,
      relationship: relationship ?? null,
      rating,
      text: text ?? null,
      isAnonymous,
      reviewerName: isAnonymous ? null : (reviewerName ?? null),
      paymentAmount,
    });

    return NextResponse.json({
      data: {
        id: review.id,
        rating: review.rating,
        relationship: review.relationship,
        text: review.text,
        isAnonymous: review.isAnonymous,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Unique constraint violation = already reviewed
    const msg = String((error as Error).message);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { error: "You have already submitted a review for this card" },
        { status: 409 },
      );
    }
    console.error("POST /api/cards/[id]/reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
