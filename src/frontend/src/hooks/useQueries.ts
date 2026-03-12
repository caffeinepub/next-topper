import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, Video } from "../backend.d";
import {
  checkAdminPassword as localCheckAdminPassword,
  saveAdminPassword as localSaveAdminPassword,
} from "../utils/adminPassword";
import { useActor } from "./useActor";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Admin Status ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      // Use isAdmin() - checks stable storage and never traps
      return actor.isAdmin();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimAdmin();
    },
    retry: 3,
    retryDelay: 2000,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}

export function useResetAndClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.resetAndClaimAdmin();
    },
    retry: 3,
    retryDelay: 2000,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}

// ─── Admin Password (local storage based for reliability) ────────────────────

export function useCheckAdminPassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      return localCheckAdminPassword(password);
    },
  });
}

export function useSetAdminPassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      localSaveAdminPassword(newPassword);
    },
  });
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export function useGetVideosByBatch(batchId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Video[]>({
    queryKey: ["videosByBatch", batchId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideosByBatch(batchId);
    },
    enabled: !!actor && !actorFetching && !!batchId,
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      batchId,
    }: { title: string; batchId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addVideo(title, batchId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["videosByBatch", variables.batchId],
      });
      queryClient.invalidateQueries({ queryKey: ["videosByBatch"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      batchId: _batchId,
    }: { id: bigint; batchId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteVideo(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["videosByBatch", variables.batchId],
      });
      queryClient.invalidateQueries({ queryKey: ["videosByBatch"] });
    },
  });
}
