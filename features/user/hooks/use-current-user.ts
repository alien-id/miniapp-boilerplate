"use client";

import { useAlien } from "@alien-id/miniapps-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api/client";
import { UserDTO } from "../dto";

export function useCurrentUser() {
  const { authToken } = useAlien();

  const { data: user, isLoading: loading, error } = useQuery({
    // Keyed by token so a token change never serves another identity's cache.
    queryKey: ["currentUser", authToken],
    queryFn: async () => UserDTO.parse(await fetchApi("/api/me", authToken!)),
    enabled: !!authToken,
  });

  return {
    user: user ?? null,
    loading,
    error: error?.message ?? null,
    isAuthenticated: !!authToken,
  };
}
