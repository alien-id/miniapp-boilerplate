import { NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import {
  findCardById,
  updateCard,
  getReviewsByCardId,
  getAverageRating,
  getProjectsByCardId,
  getServicesByCardId,
} from "@/features/cards/queries";
import { UpdateCardRequest } from "@/features/cards/dto";
import { JwtErrors } from "@alien_org/auth-client";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const card = await findCardById(id);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    const [reviews, projects, services] = await Promise.all([
      getReviewsByCardId(id),
      getProjectsByCardId(id),
      getServicesByCardId(id),
    ]);
    const averageRating = getAverageRating(reviews);

    return NextResponse.json({
      data: {
        card: {
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
        projects: projects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          imageUrl: p.imageUrl,
          linkUrl: p.linkUrl,
          createdAt: p.createdAt.toISOString(),
        })),
        services: services.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          price: s.price,
          imageUrl: s.imageUrl,
          tags: s.tags,
          createdAt: s.createdAt.toISOString(),
        })),
        reviews: reviews.map((r) => ({
          id: r.id,
          relationship: r.relationship,
          rating: r.rating,
          text: r.text,
          isAnonymous: r.isAnonymous,
          reviewerName: r.isAnonymous ? null : r.reviewerName,
          displayName: r.isAnonymous ? "Verified Human" : r.reviewerName ?? "Verified Human",
          createdAt: r.createdAt.toISOString(),
        })),
        averageRating,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    console.error("GET /api/cards/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const { sub } = await verifyToken(token);
    const { id } = await params;

    const body = await request.json();
    const parsed = UpdateCardRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const card = await updateCard(id, sub, parsed.data);
    if (!card) {
      return NextResponse.json({ error: "Card not found or not owner" }, { status: 404 });
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
    console.error("PUT /api/cards/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
