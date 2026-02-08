"use client";

import { useQuery } from "@tanstack/react-query";

export type ReviewDTO = {
  id: string;
  relationship: string | null;
  rating: number;
  text: string | null;
  isAnonymous: boolean;
  reviewerName: string | null;
  displayName: string;
  createdAt: string;
};

export type ProjectDTO = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  createdAt: string;
};

export type ServiceDTO = {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  tags: string | null;
  createdAt: string;
};

export type CardWithReviewsDTO = {
  card: {
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
  projects: ProjectDTO[];
  services: ServiceDTO[];
  reviews: ReviewDTO[];
  averageRating: number | null;
  reviewCount: number;
};

async function fetchCard(id: string): Promise<CardWithReviewsDTO> {
  const res = await fetch(`/api/cards/${id}`);
  if (!res.ok) {
    const j = await res.json();
    throw new Error(j.error ?? "Failed to fetch card");
  }
  const json = await res.json();
  return json.data;
}

export function useCard(id: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["card", id],
    queryFn: () => fetchCard(id!),
    enabled: !!id,
  });
  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
