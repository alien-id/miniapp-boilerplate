"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAlien } from "@alien_org/react";
import { useCard } from "@/features/cards/hooks/use-card";
import { useMyCard } from "@/features/cards/hooks/use-my-card";
import toast from "react-hot-toast";

export default function RequestReviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { authToken } = useAlien();
  const { card: myCard } = useMyCard();
  const { data, loading, error } = useCard(id);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewLink, setReviewLink] = useState<string | null>(null);

  if (!authToken) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-600">Sign in to request a review.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
          Back home
        </Link>
      </div>
    );
  }

  if (loading) return <div className="py-12 text-center text-sm text-zinc-500">Loading…</div>;
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

  const isOwner = myCard?.id === data.card.id;
  if (!isOwner) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-600">You can only request reviews for your own card.</p>
        <Link href={`/card/${id}`} className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
          View card
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/cards/${id}/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentAmount: Math.max(0, parseFloat(paymentAmount) || 0),
          note: note.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create link");
      setReviewLink(json.data.reviewLink);
      toast.success("Review link created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reviewLink) return;
    void navigator.clipboard.writeText(reviewLink);
    toast.success("Link copied");
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Request a review</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Generate a link to send to someone. They can leave a verified review.
        </p>
      </div>

      <div className="rounded border border-zinc-200 bg-zinc-50/50 p-4">
        <p className="font-medium text-zinc-900">{data.card.name}</p>
        {data.card.title && (
          <p className="text-sm text-zinc-600">{data.card.title}</p>
        )}
      </div>

      {reviewLink ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-700">Your review link</p>
          <div className="rounded border border-zinc-200 bg-white p-3 text-sm text-zinc-600 break-all">
            {reviewLink}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="h-12 w-full rounded bg-black font-medium text-white"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={() => setReviewLink(null)}
            className="text-sm text-zinc-500 underline"
          >
            Create another link
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Reward amount (Aliencoin)
            </label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0"
              className="h-12 w-full rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
            />
            <p className="mt-0.5 text-xs text-zinc-500">
              Optional. Show reviewers they’ll receive this amount when they submit.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              placeholder="Hey, would love an honest review!"
              rows={2}
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitLoading}
            className="h-12 w-full rounded bg-black font-medium text-white disabled:opacity-60"
          >
            {submitLoading ? "Creating…" : "Generate review link"}
          </button>
        </form>
      )}

      <Link
        href={`/card/${id}`}
        className="text-center text-sm text-zinc-600 underline"
      >
        Back to card
      </Link>
    </div>
  );
}
