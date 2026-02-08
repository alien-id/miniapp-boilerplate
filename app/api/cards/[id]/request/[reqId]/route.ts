import { NextResponse } from "next/server";
import { findCardById, findReviewRequestById } from "@/features/cards/queries";

type Params = { params: Promise<{ id: string; reqId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id: cardId, reqId } = await params;

    const card = await findCardById(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const reviewRequest = await findReviewRequestById(reqId, cardId);
    if (!reviewRequest) {
      return NextResponse.json({ error: "Review request not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        card: {
          id: card.id,
          name: card.name,
          title: card.title,
          avatarUrl: card.avatarUrl,
        },
        request: {
          id: reviewRequest.id,
          paymentAmount: reviewRequest.paymentAmount,
          note: reviewRequest.note,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/cards/[id]/request/[reqId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
