import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Favorite } from "@shared/schema";

export function useCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("currentUserId");
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export function useFavorites() {
  const currentUserId = useCurrentUserId();
  const favQKey = ["/api/favorites", currentUserId];

  const { data: favoritesData = [], isLoading } = useQuery<Favorite[]>({
    queryKey: favQKey,
    queryFn: async () => {
      if (!currentUserId) return [];
      const res = await fetch(`/api/favorites/${currentUserId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentUserId,
    staleTime: 30_000,
  });

  const favoritedIds = useMemo(
    () => new Set(favoritesData.map((f) => f.favoriteUserId)),
    [favoritesData]
  );

  const addMutation = useMutation({
    mutationFn: (favoriteUserId: number) =>
      apiRequest("POST", "/api/favorites", { userId: currentUserId, favoriteUserId }),
    onMutate: async (favoriteUserId: number) => {
      await queryClient.cancelQueries({ queryKey: favQKey });
      const previous = queryClient.getQueryData<Favorite[]>(favQKey) ?? [];
      const optimistic: Favorite = {
        id: -1,
        userId: currentUserId!,
        favoriteUserId,
        createdAt: new Date(),
      };
      queryClient.setQueryData<Favorite[]>(favQKey, [...previous, optimistic]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(favQKey, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favQKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (favoriteUserId: number) =>
      apiRequest("DELETE", `/api/favorites/${currentUserId}/${favoriteUserId}`),
    onMutate: async (favoriteUserId: number) => {
      await queryClient.cancelQueries({ queryKey: favQKey });
      const previous = queryClient.getQueryData<Favorite[]>(favQKey) ?? [];
      queryClient.setQueryData<Favorite[]>(
        favQKey,
        previous.filter((f) => f.favoriteUserId !== favoriteUserId)
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(favQKey, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favQKey });
    },
  });

  const pendingFavoriteId =
    (addMutation.isPending ? addMutation.variables : null) ??
    (removeMutation.isPending ? removeMutation.variables : null);

  const toggleFavorite = (favoriteUserId: number) => {
    if (!currentUserId) return;
    if (pendingFavoriteId === favoriteUserId) return;
    if (favoritedIds.has(favoriteUserId)) {
      removeMutation.mutate(favoriteUserId);
    } else {
      addMutation.mutate(favoriteUserId);
    }
  };

  return {
    currentUserId,
    favoritesData,
    favoritedIds,
    isLoading,
    favoritesReady: !currentUserId || !isLoading,
    pendingFavoriteId,
    toggleFavorite,
  };
}
