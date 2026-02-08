import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { findCardByAlienId } from "@/features/cards/queries";
import { JwtErrors } from "@alien_org/auth-client";

export async function GET(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const { sub } = await verifyToken(token);

    const card = await findCardByAlienId(sub);
    if (!card) {
      return NextResponse.json({ data: null });
    }
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
    console.error("GET /api/cards/me:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
