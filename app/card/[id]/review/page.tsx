"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAlien } from "@alien_org/react";
import toast from "react-hot-toast";
import { RELATIONSHIPS } from "@/features/cards/dto";

const MAX_TEXT = 280;

export default function LeaveReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const requestId = searchParams.get("request");
  const { authToken } = useAlien();

  const [card, setCard] = useState<{ name: string; title: string | null; avatarUrl: string | null } | null>(null);
  const [request, setRequest] = useState<{ paymentAmount: number; note: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reviewerName, setReviewerName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (requestId) {
          const res = await fetch(`/api/cards/${id}/request/${requestId}`);
          if (!res.ok) throw new Error("Request not found");
          const json = await res.json();
          setCard(json.data.card);
          setRequest(json.data.request);
        } else {
          const res = await fetch(`/api/cards/${id}`);
          if (!res.ok) throw new Error("Card not found");
          const json = await res.json();
          setCard(json.data.card);
          setRequest(null);
        }
      } catch {
        setCard(null);
        setRequest(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, requestId]);

  if (!authToken) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-600">Sign in to leave a review.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
          Back home
        </Link>
      </div>
    );
  }

  if (loading) return <div className="py-12 text-center text-sm text-zinc-500">Loading…</div>;
  if (!card) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-600">Card or request not found.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
          Back home
        </Link>
      </div>
    );
  }

  const paymentAmount = request?.paymentAmount ?? 0;
  const hasPayment = paymentAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }
    if (!authToken) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/cards/${id}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relationship: relationship || null,
          rating,
          text: text.trim().slice(0, MAX_TEXT) || null,
          isAnonymous,
          reviewerName: isAnonymous ? null : (reviewerName.trim() || null),
          requestId: requestId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit");
      setSubmitted(true);
      toast.success("Review submitted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col gap-6 py-12 text-center">
        <p className="text-lg font-medium text-zinc-900">Thanks! Your review was submitted.</p>
        <Link
          href={`/card/${id}`}
          className="inline-block h-12 rounded bg-black px-6 font-medium leading-[3rem] text-white"
        >
          View card
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 rounded border border-zinc-200 bg-zinc-50/50 p-4">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-zinc-200">
          {card.avatarUrl ? (
            <img src={card.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-zinc-500">
              {card.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="font-bold text-zinc-900">{card.name}</p>
          {card.title && <p className="text-sm text-zinc-600">{card.title}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            How do you know this person?
          </label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRelationship(r)}
                className={`rounded border px-3 py-1.5 text-sm ${
                  relationship === r
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className={`h-10 w-10 rounded-full border-2 ${
                  i <= rating
                    ? "border-zinc-900 bg-zinc-900"
                    : "border-zinc-300 bg-transparent"
                }`}
                aria-label={`${i} stars`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Your review (optional)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            placeholder="A few words about working with them..."
            maxLength={MAX_TEXT}
            rows={3}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
          />
          <p className="mt-0.5 text-xs text-zinc-500">{text.length} of {MAX_TEXT}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!isAnonymous}
              onChange={(e) => setIsAnonymous(!e.target.checked)}
              className="rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">Show my name</span>
          </label>
          {!isAnonymous && (
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value.slice(0, 48))}
              placeholder="Your name"
              className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={submitLoading || rating < 1}
          className="h-12 w-full rounded bg-black font-medium text-white disabled:opacity-60"
        >
          {submitLoading
            ? "Submitting…"
            : hasPayment
              ? `Submit review & collect ${paymentAmount} Aliencoin`
              : "Submit review"}
        </button>
      </form>

      <Link
        href={`/card/${id}`}
        className="text-center text-sm text-zinc-600 underline"
      >
        Back to card
      </Link>
    </div>
  );
}
