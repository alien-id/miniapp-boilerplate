import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { createCard, findCardByAlienId } from "@/features/cards/queries";
import { CreateCardRequest } from "@/features/cards/dto";
import { JwtErrors } from "@alien_org/auth-client";

export async function POST(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const { sub } = await verifyToken(token);

    const existing = await findCardByAlienId(sub);
    if (existing) {
      return NextResponse.json(
        { error: "You already have a card", cardId: existing.id },
        { status: 409 },
      );
    }

    const body = await request.json();
    const parsed = CreateCardRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const card = await createCard(sub, parsed.data);
    return NextResponse.json({
      data: {
        id: card.id,
        alienId: card.alienId,
        name: card.name,
        title: card.title,
        bio: card.bio,
        avatarUrl: card.avatarUrl,
        bannerUrl: card.bannerUrl,
        portfolioUrl: card.portfolioUrl,
        linkedinUrl: card.linkedinUrl,
        twitterUrl: card.twitterUrl,
        instagramUrl: card.instagramUrl,
        tiktokUrl: card.tiktokUrl,
        githubUrl: card.githubUrl,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("POST /api/cards:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
