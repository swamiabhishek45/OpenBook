"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Workspace {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  defaultModel: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sources: number;
    conversation: number;
    artifacts: number;
  };
}

export function useWorkspaces() {
  const queryClient = useQueryClient();

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await apiClient<{ success?: boolean; data?: Workspace[]; workspaces?: Workspace[] }>(
        "/api/workspaces"
      );
      if (Array.isArray(res)) return res as Workspace[];
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.workspaces && Array.isArray(res.workspaces)) return res.workspaces;
      return [];
    },
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (input: { title: string; description?: string; icon?: string; defaultModel?: string }) => {
      return await apiClient<Workspace>("/api/workspaces", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      title?: string;
      description?: string;
      icon?: string;
      defaultModel?: string;
    }) => {
      return await apiClient<Workspace>(`/api/workspaces/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      return await apiClient(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return {
    workspaces: workspacesQuery.data || [],
    isLoading: workspacesQuery.isLoading,
    isError: workspacesQuery.isError,
    error: workspacesQuery.error,
    refetch: workspacesQuery.refetch,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    isCreating: createWorkspaceMutation.isPending,
    updateWorkspace: updateWorkspaceMutation.mutateAsync,
    isUpdating: updateWorkspaceMutation.isPending,
    deleteWorkspace: deleteWorkspaceMutation.mutateAsync,
    isDeleting: deleteWorkspaceMutation.isPending,
  };
}
