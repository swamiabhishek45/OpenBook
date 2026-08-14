"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { LearningArtifact, ArtifactType } from "../types";

export function useArtifacts(workspaceId: string) {
  const queryClient = useQueryClient();

  const artifactsQuery = useQuery({
    queryKey: ["artifacts", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await apiClient<LearningArtifact[] | { data: LearningArtifact[] }>(
        `/api/workspaces/${workspaceId}/artifacts`
      );
      return Array.isArray(res) ? res : res.data || [];
    },
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      // Auto-poll if any artifact is pending or processing
      const hasProcessing = query.state.data?.some(
        (a) => a.status === "PENDING" || a.status === "PROCESSING"
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const createArtifactMutation = useMutation({
    mutationFn: async ({
      type,
      title,
      sourceIds,
    }: {
      type: ArtifactType;
      title?: string;
      sourceIds?: string[];
    }) => {
      return await apiClient<LearningArtifact>(
        `/api/workspaces/${workspaceId}/artifacts`,
        {
          method: "POST",
          body: JSON.stringify({ type, title, sourceIds }),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifacts", workspaceId] });
    },
  });

  const deleteArtifactMutation = useMutation({
    mutationFn: async (artifactId: string) => {
      return await apiClient(
        `/api/workspaces/${workspaceId}/artifacts/${artifactId}`,
        {
          method: "DELETE",
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifacts", workspaceId] });
    },
  });

  return {
    artifacts: artifactsQuery.data || [],
    isLoading: artifactsQuery.isLoading,
    isError: artifactsQuery.isError,
    error: artifactsQuery.error,
    refetch: artifactsQuery.refetch,
    createArtifact: createArtifactMutation.mutateAsync,
    isCreating: createArtifactMutation.isPending,
    deleteArtifact: deleteArtifactMutation.mutateAsync,
    isDeleting: deleteArtifactMutation.isPending,
  };
}
