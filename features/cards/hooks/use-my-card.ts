"use client";

import { useAlien } from "@alien_org/react";
import { useQuery } from "@tanstack/react-query";

export type CardDTO = {
  id: string;
  alienId: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchMyCard(token: string): Promise<CardDTO | null> {
  const res = await fetch("/api/cards/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Failed to fetch");
  const json = await res.json();
  return json.data;
}

export function useMyCard() {
  const { authToken } = useAlien();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["myCard"],
    queryFn: () => fetchMyCard(authToken!),
    enabled: !!authToken,
  });
  return { card: data ?? null, loading: isLoading, error: error?.message ?? null, refetch };
}
