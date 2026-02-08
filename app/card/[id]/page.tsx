"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAlien } from "@alien_org/react";
import { useCard } from "@/features/cards/hooks/use-card";
import { useMyCard } from "@/features/cards/hooks/use-my-card";

function RatingDots({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i <= rating ? "bg-zinc-900" : "bg-zinc-300"}`}
        />
      ))}
    </div>
  );
}

function SocialLinks({
  portfolioUrl,
  linkedinUrl,
  twitterUrl,
  instagramUrl,
  tiktokUrl,
  githubUrl,
}: {
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  githubUrl: string | null;
}) {
  const links: { label: string; url: string | null }[] = [
    { label: "Website", url: portfolioUrl },
    { label: "LinkedIn", url: linkedinUrl },
    { label: "Twitter", url: twitterUrl },
    { label: "Instagram", url: instagramUrl },
    { label: "TikTok", url: tiktokUrl },
    { label: "GitHub", url: githubUrl },
  ].filter((l) => l.url);
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {links.map(({ label, url }) =>
        url ? (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
          >
            {label}
          </a>
        ) : null,
      )}
    </div>
  );
}

export default function CardPage() {
  const params = useParams();
  const id = params.id as string;
  const { authToken } = useAlien();
  const { card: myCard } = useMyCard();
  const { data, loading, error } = useCard(id);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">Loading…</div>
    );
  }
  if (error || !data) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-600">{error ?? "Card not found"}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
          Back home
        </Link>
      </div>
    );
  }

  const { card, projects, services, reviews, averageRating, reviewCount } = data;
  const isOwner = !!authToken && myCard?.id === card.id;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Banner (optional) */}
      {card.bannerUrl && (
        <div className="-mx-6 -mt-6 h-32 overflow-hidden rounded-b-lg bg-zinc-200 sm:rounded-b-xl">
          <img
            src={card.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Profile header: pic, name, title, links */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={`h-20 w-20 overflow-hidden rounded-full border-2 border-white bg-zinc-100 shadow-md ${card.bannerUrl ? "-mt-12" : ""}`}
        >
          {card.avatarUrl ? (
            <img
              src={card.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-zinc-400">
              {card.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{card.name}</h1>
          {card.title && (
            <p className="mt-0.5 text-base text-zinc-600">{card.title}</p>
          )}
        </div>
        <SocialLinks
          portfolioUrl={card.portfolioUrl}
          linkedinUrl={card.linkedinUrl}
          twitterUrl={card.twitterUrl}
          instagramUrl={card.instagramUrl}
          tiktokUrl={card.tiktokUrl}
          githubUrl={card.githubUrl}
        />
      </div>

      {/* Trust badge */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-center">
        <span className="text-sm font-medium text-zinc-700">
          {averageRating != null ? (
            <>★ {averageRating.toFixed(1)} · Verified by {reviewCount} human{reviewCount !== 1 ? "s" : ""}</>
          ) : (
            <>No reviews yet</>
          )}
        </span>
      </div>

      {/* Primary CTA: Edit profile / Add to profile (owner) or Share */}
      <div className="flex flex-col gap-3">
        {isOwner ? (
          <>
            <Link
              href={`/card/${id}/edit`}
              className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white shadow-sm"
            >
              Edit profile
            </Link>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(typeof window !== "undefined" ? window.location.href : "")}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-medium text-zinc-700"
              >
                Share
              </button>
              <Link
                href={`/card/${id}/request`}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-medium text-zinc-700"
              >
                Request review
              </Link>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(typeof window !== "undefined" ? window.location.href : "")}
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-medium text-zinc-700"
          >
            Share card
          </button>
        )}
      </div>

      {/* About */}
      {card.bio && (
        <section>
          <h2 className="text-lg font-bold text-zinc-900">About</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-700">
            {card.bio}
          </p>
        </section>
      )}

      {/* Projects */}
      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-900">Projects</h2>
          {projects.length > 2 && (
            <span className="text-sm text-zinc-500">View all ({projects.length})</span>
          )}
        </div>
        {projects.length === 0 ? (
          isOwner ? (
            <p className="mt-2 text-sm text-zinc-500">
              No projects yet.{" "}
              <Link href={`/card/${id}/edit`} className="font-medium text-zinc-900 underline">
                Add one
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No projects yet.</p>
          )
        ) : (
          <ul className="mt-3 flex flex-col gap-4 sm:grid sm:grid-cols-2">
            {projects.slice(0, 4).map((p) => (
              <li key={p.id}>
                <div className="block overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-zinc-300">
                  {p.imageUrl ? (
                    <div className="aspect-video w-full bg-zinc-100">
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-zinc-100" />
                  )}
                  <div className="p-3">
                    {p.linkUrl ? (
                      <a
                        href={p.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {p.title}
                      </a>
                    ) : (
                      <p className="font-medium text-zinc-900">{p.title}</p>
                    )}
                    {p.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reviews */}
      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-900">Reviews</h2>
          {reviewCount > 0 && (
            <span className="text-sm text-zinc-500">View all ({reviewCount})</span>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No reviews yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <RatingDots rating={r.rating} />
                  {r.relationship && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
                      {r.relationship}
                    </span>
                  )}
                </div>
                {r.text && (
                  <p className="mt-2 text-[15px] leading-relaxed text-zinc-700">
                    {r.text}
                  </p>
                )}
                <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className="text-green-600">✓</span> Verified Human
                  <span>·</span>
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Services */}
      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-900">Services</h2>
          {services.length > 2 && (
            <span className="text-sm text-zinc-500">View all ({services.length})</span>
          )}
        </div>
        {services.length === 0 ? (
          isOwner ? (
            <p className="mt-2 text-sm text-zinc-500">
              No services yet.{" "}
              <Link href={`/card/${id}/edit`} className="font-medium text-zinc-900 underline">
                Add one
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No services yet.</p>
          )
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {services.slice(0, 4).map((s) => (
              <li key={s.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                {s.imageUrl && (
                  <div className="aspect-[2/1] w-full bg-zinc-100">
                    <img
                      src={s.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-zinc-900">{s.title}</p>
                    {s.price && (
                      <span className="text-sm font-medium text-zinc-700">{s.price}</span>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-1 text-sm text-zinc-600">{s.description}</p>
                  )}
                  {s.tags && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.tags.split(",").map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {authToken && !isOwner && (
        <Link
          href={`/card/${id}/review`}
          className="flex h-12 items-center justify-center rounded-full bg-zinc-900 font-medium text-white"
        >
          Leave a review
        </Link>
      )}
    </div>
  );
}
