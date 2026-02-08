"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAlien } from "@alien_org/react";
import { useCard } from "@/features/cards/hooks/use-card";
import { useMyCard } from "@/features/cards/hooks/use-my-card";
import { EditCardForm } from "@/features/cards/components/edit-card-form";
import { EditProjectsSection } from "@/features/cards/components/edit-projects-section";
import { EditServicesSection } from "@/features/cards/components/edit-services-section";

export default function EditCardPage() {
  const params = useParams();
  const id = params.id as string;
  const { authToken } = useAlien();
  const { card: myCard } = useMyCard();
  const { data, loading, error } = useCard(id);

  if (!authToken) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-600">Sign in to edit your card.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
          Back home
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-zinc-500">Loading…</div>;
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

  const isOwner = myCard?.id === data.card.id;
  if (!isOwner) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-600">You can only edit your own card.</p>
        <Link href={`/card/${id}`} className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
          View card
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Edit profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Update your card, projects, and services.</p>
      </div>
      <EditCardForm cardId={id} initial={data.card} />
      <EditProjectsSection cardId={id} projects={data.projects} />
      <EditServicesSection cardId={id} services={data.services} />
      <Link
        href={`/card/${id}`}
        className="text-center text-sm text-zinc-600 underline"
      >
        Back to card
      </Link>
    </div>
  );
}
