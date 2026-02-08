"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMyCard } from "@/features/cards/hooks/use-my-card";
import { useAlien } from "@alien_org/react";
import { CreateCardForm } from "@/features/cards/components/create-card-form";

export default function Home() {
  const router = useRouter();
  const { authToken } = useAlien();
  const { card, loading } = useMyCard();

  useEffect(() => {
    if (loading || !authToken) return;
    if (card) {
      router.replace(`/card/${card.id}`);
    }
  }, [card, loading, authToken, router]);

  if (loading && authToken) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (card) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-sm text-zinc-500">Redirecting to your card…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Cosign</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your professional card with verified human reviews.
        </p>
      </div>
      {authToken ? (
        <CreateCardForm />
      ) : (
        <p className="text-sm text-zinc-600">
          Open Cosign in the Alien app to create your card.
        </p>
      )}
    </div>
  );
}
