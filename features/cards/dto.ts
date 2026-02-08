import { z } from "zod";

const MAX_BIO = 280;
const MAX_NAME = 48;
const MAX_TITLE = 120;

export const CreateCardRequest = z.object({
  name: z.string().min(1).max(MAX_NAME),
  title: z.string().max(MAX_TITLE).optional().nullable(),
  bio: z.string().max(MAX_BIO).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  tiktokUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
});

export const CreateProjectRequest = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
});
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>;

export const UpdateProjectRequest = CreateProjectRequest.partial();
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequest>;

export const CreateServiceRequest = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  price: z.string().max(30).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  tags: z.string().max(200).optional().nullable(),
});
export type CreateServiceRequest = z.infer<typeof CreateServiceRequest>;

export const UpdateServiceRequest = CreateServiceRequest.partial();
export type UpdateServiceRequest = z.infer<typeof UpdateServiceRequest>;
export type CreateCardRequest = z.infer<typeof CreateCardRequest>;

export const UpdateCardRequest = CreateCardRequest.partial();
export type UpdateCardRequest = z.infer<typeof UpdateCardRequest>;

export const RELATIONSHIPS = ["Hired them", "Worked together", "Collaborated", "Other"] as const;
export const CreateReviewRequest = z.object({
  relationship: z.enum(RELATIONSHIPS).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(280).optional().nullable(),
  isAnonymous: z.boolean().default(true),
  reviewerName: z.string().max(MAX_NAME).optional().nullable(),
  requestId: z.string().uuid().optional().nullable(), // for paid review link
});
export type CreateReviewRequest = z.infer<typeof CreateReviewRequest>;

export const CreateReviewRequestRequest = z.object({
  paymentAmount: z.number().min(0).default(0),
  note: z.string().max(500).optional().nullable(),
});
export type CreateReviewRequestRequest = z.infer<typeof CreateReviewRequestRequest>;

export const ScrapeRequest = z.object({
  url: z.string().url(),
});
export type ScrapeRequest = z.infer<typeof ScrapeRequest>;
