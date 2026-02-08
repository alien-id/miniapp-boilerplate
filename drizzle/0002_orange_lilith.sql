CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alien_id" text NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"bio" text,
	"avatar_url" text,
	"portfolio_url" text,
	"linkedin_url" text,
	"twitter_url" text,
	"instagram_url" text,
	"tiktok_url" text,
	"github_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cards_alien_id_unique" UNIQUE("alien_id")
);
--> statement-breakpoint
CREATE TABLE "review_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"payment_amount" real DEFAULT 0,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"reviewer_alien_id" text NOT NULL,
	"relationship" text,
	"rating" integer NOT NULL,
	"text" text,
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"reviewer_name" text,
	"payment_amount" real DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_card_reviewer_unique" UNIQUE("card_id","reviewer_alien_id")
);
--> statement-breakpoint
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;