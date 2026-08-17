"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface WorkspaceDetail {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  icon: string | null;
  defaultModel: string;
  createdAt: string;
  updatedAt: string;
}

export function useWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await apiClient<WorkspaceDetail | { data: WorkspaceDetail }>(
        `/api/workspaces/${workspaceId}`
      );
      const data =
        res && typeof res === "object" && "data" in res ? res.data : res;
      return (data as WorkspaceDetail) || null;
    },
    enabled: !!workspaceId,
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async (input: {
      title?: string;
      description?: string;
      icon?: string;
      defaultModel?: string;
    }) => {
      return await apiClient<WorkspaceDetail>(
        `/api/workspaces/${workspaceId}`,
        {
          method: "PATCH",
          body: JSON.stringify(input),
        }
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["workspace", workspaceId], data);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return {
    workspace: workspaceQuery.data,
    isLoading: workspaceQuery.isLoading,
    isError: workspaceQuery.isError,
    error: workspaceQuery.error,
    updateWorkspace: updateWorkspaceMutation.mutateAsync,
    isUpdating: updateWorkspaceMutation.isPending,
  };
}
