import { pgTable, text, timestamp, uuid, jsonb, integer, boolean, real, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  alienId: text("alien_id").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;

export const paymentIntents = pgTable("payment_intents", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice: text("invoice").notNull().unique(),
  senderAlienId: text("sender_alien_id").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  amount: text("amount").notNull(),
  token: text("token").notNull(),
  network: text("network").notNull(),
  productId: text("product_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PaymentIntent = typeof paymentIntents.$inferSelect;

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderAlienId: text("sender_alien_id"),
  recipientAddress: text("recipient_address").notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull(),
  amount: text("amount"),
  token: text("token"),
  network: text("network"),
  invoice: text("invoice"),
  test: text("test"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;

// Cosign: professional cards with verified reviews
export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  alienId: text("alien_id").notNull().unique(),
  name: text("name").notNull(),
  title: text("title"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  portfolioUrl: text("portfolio_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Card = typeof cards.$inferSelect;

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    reviewerAlienId: text("reviewer_alien_id").notNull(),
    relationship: text("relationship"),
    rating: integer("rating").notNull(),
    text: text("text"),
    isAnonymous: boolean("is_anonymous").notNull().default(true),
    reviewerName: text("reviewer_name"),
    paymentAmount: real("payment_amount").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("reviews_card_reviewer_unique").on(t.cardId, t.reviewerAlienId)],
);

export type Review = typeof reviews.$inferSelect;

export const reviewRequests = pgTable("review_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  paymentAmount: real("payment_amount").default(0),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReviewRequest = typeof reviewRequests.$inferSelect;

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  price: text("price"),
  imageUrl: text("image_url"),
  tags: text("tags"), // comma-separated or JSON; keep simple
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Service = typeof services.$inferSelect;
