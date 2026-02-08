import { eq, and, desc, asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Card, Review, ReviewRequest, Project, Service } from "@/lib/db/schema";
import type {
  CreateCardRequest,
  UpdateCardRequest,
  CreateReviewRequestRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
} from "./dto";

export async function findCardById(id: string): Promise<Card | undefined> {
  const row = await db.query.cards.findFirst({
    where: eq(schema.cards.id, id),
  });
  return row;
}

export async function findCardByAlienId(alienId: string): Promise<Card | undefined> {
  const row = await db.query.cards.findFirst({
    where: eq(schema.cards.alienId, alienId),
  });
  return row;
}

export async function createCard(alienId: string, data: CreateCardRequest): Promise<Card> {
  const [card] = await db
    .insert(schema.cards)
    .values({
      alienId,
      name: data.name,
      title: data.title ?? null,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl ?? null,
      bannerUrl: data.bannerUrl ?? null,
      portfolioUrl: data.portfolioUrl ?? null,
      linkedinUrl: data.linkedinUrl ?? null,
      twitterUrl: data.twitterUrl ?? null,
      instagramUrl: data.instagramUrl ?? null,
      tiktokUrl: data.tiktokUrl ?? null,
      githubUrl: data.githubUrl ?? null,
    })
    .returning();
  if (!card) throw new Error("Failed to create card");
  return card;
}

export async function updateCard(
  cardId: string,
  alienId: string,
  data: UpdateCardRequest,
): Promise<Card | null> {
  const [updated] = await db
    .update(schema.cards)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.cards.id, cardId), eq(schema.cards.alienId, alienId)))
    .returning();
  return updated ?? null;
}

export async function getReviewsByCardId(cardId: string): Promise<Review[]> {
  return db.query.reviews.findMany({
    where: eq(schema.reviews.cardId, cardId),
    orderBy: [desc(schema.reviews.createdAt)],
  });
}

export async function createReview(params: {
  cardId: string;
  reviewerAlienId: string;
  relationship: string | null;
  rating: number;
  text: string | null;
  isAnonymous: boolean;
  reviewerName: string | null;
  paymentAmount: number;
}): Promise<Review> {
  const [review] = await db
    .insert(schema.reviews)
    .values({
      cardId: params.cardId,
      reviewerAlienId: params.reviewerAlienId,
      relationship: params.relationship,
      rating: params.rating,
      text: params.text,
      isAnonymous: params.isAnonymous,
      reviewerName: params.reviewerName,
      paymentAmount: params.paymentAmount,
    })
    .returning();
  if (!review) throw new Error("Failed to create review");
  return review;
}

export async function createReviewRequest(
  cardId: string,
  data: CreateReviewRequestRequest,
): Promise<ReviewRequest> {
  const [req] = await db
    .insert(schema.reviewRequests)
    .values({
      cardId,
      paymentAmount: data.paymentAmount ?? 0,
      note: data.note ?? null,
    })
    .returning();
  if (!req) throw new Error("Failed to create review request");
  return req;
}

export async function findReviewRequestById(
  requestId: string,
  cardId: string,
): Promise<ReviewRequest | undefined> {
  return db.query.reviewRequests.findFirst({
    where: and(
      eq(schema.reviewRequests.id, requestId),
      eq(schema.reviewRequests.cardId, cardId),
    ),
  });
}

export function getAverageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // one decimal
}

export async function getProjectsByCardId(cardId: string): Promise<Project[]> {
  return db.query.projects.findMany({
    where: eq(schema.projects.cardId, cardId),
    orderBy: [asc(schema.projects.sortOrder), desc(schema.projects.createdAt)],
  });
}

export async function createProject(
  cardId: string,
  alienId: string,
  data: CreateProjectRequest,
): Promise<Project | null> {
  const card = await findCardById(cardId);
  if (!card || card.alienId !== alienId) return null;
  const [project] = await db
    .insert(schema.projects)
    .values({
      cardId,
      title: data.title,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      linkUrl: data.linkUrl ?? null,
    })
    .returning();
  return project ?? null;
}

export async function updateProject(
  projectId: string,
  cardId: string,
  alienId: string,
  data: UpdateProjectRequest,
): Promise<Project | null> {
  const card = await findCardById(cardId);
  if (!card || card.alienId !== alienId) return null;
  const [updated] = await db
    .update(schema.projects)
    .set(data)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.cardId, cardId)))
    .returning();
  return updated ?? null;
}

export async function deleteProject(
  projectId: string,
  cardId: string,
  alienId: string,
): Promise<boolean> {
  const card = await findCardById(cardId);
  if (!card || card.alienId !== alienId) return false;
  const deleted = await db
    .delete(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.cardId, cardId)))
    .returning({ id: schema.projects.id });
  return deleted.length > 0;
}

export async function getServicesByCardId(cardId: string): Promise<Service[]> {
  return db.query.services.findMany({
    where: eq(schema.services.cardId, cardId),
    orderBy: [asc(schema.services.sortOrder), desc(schema.services.createdAt)],
  });
}

export async function createService(
  cardId: string,
  alienId: string,
  data: CreateServiceRequest,
): Promise<Service | null> {
  const card = await findCardById(cardId);
  if (!card || card.alienId !== alienId) return null;
  const [service] = await db
    .insert(schema.services)
    .values({
      cardId,
      title: data.title,
      description: data.description ?? null,
      price: data.price ?? null,
      imageUrl: data.imageUrl ?? null,
      tags: data.tags ?? null,
    })
    .returning();
  return service ?? null;
}

export async function updateService(
  serviceId: string,
  cardId: string,
  alienId: string,
  data: UpdateServiceRequest,
): Promise<Service | null> {
  const card = await findCardById(cardId);
  if (!card || card.alienId !== alienId) return null;
  const [updated] = await db
    .update(schema.services)
    .set(data)
    .where(and(eq(schema.services.id, serviceId), eq(schema.services.cardId, cardId)))
    .returning();
  return updated ?? null;
}

export async function deleteService(
  serviceId: string,
  cardId: string,
  alienId: string,
): Promise<boolean> {
  const card = await findCardById(cardId);
  if (!card || card.alienId !== alienId) return false;
  const deleted = await db
    .delete(schema.services)
    .where(and(eq(schema.services.id, serviceId), eq(schema.services.cardId, cardId)))
    .returning({ id: schema.services.id });
  return deleted.length > 0;
}
