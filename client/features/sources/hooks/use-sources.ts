"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Source } from "../types";
import { useState } from "react";

export function useSources(workspaceId: string) {
  const queryClient = useQueryClient();
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  const sourcesQuery = useQuery({
    queryKey: ["sources", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await apiClient<Source[] | { data: Source[] }>(
        `/api/workspaces/${workspaceId}/sources`
      );
      const data = Array.isArray(res) ? res : res.data || [];
      return data;
    },
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      // Auto-poll if any source is pending or processing
      const hasProcessing = query.state.data?.some(
        (s) => s.status === "PENDING" || s.status === "PROCESSING"
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const uploadPdfMutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);

      return await apiClient<Source>(`/api/workspaces/${workspaceId}/sources/upload`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (newSource) => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
      if (newSource?.id) {
        setSelectedSourceIds((prev) => [...prev, newSource.id]);
      }
    },
  });

  const importWebsiteMutation = useMutation({
    mutationFn: async ({ url, title }: { url: string; title?: string }) => {
      return await apiClient<Source>(
        `/api/workspaces/${workspaceId}/sources/import/website`,
        {
          method: "POST",
          body: JSON.stringify({ url, title }),
        }
      );
    },
    onSuccess: (newSource) => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
      if (newSource?.id) {
        setSelectedSourceIds((prev) => [...prev, newSource.id]);
      }
    },
  });

  const importYoutubeMutation = useMutation({
    mutationFn: async ({ url, title }: { url: string; title?: string }) => {
      return await apiClient<Source>(
        `/api/workspaces/${workspaceId}/sources/import/youtube`,
        {
          method: "POST",
          body: JSON.stringify({ url, title }),
        }
      );
    },
    onSuccess: (newSource) => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
      if (newSource?.id) {
        setSelectedSourceIds((prev) => [...prev, newSource.id]);
      }
    },
  });

  const createTextSourceMutation = useMutation({
    mutationFn: async ({
      title,
      content,
      type = "TEXT",
    }: {
      title: string;
      content: string;
      type?: "TEXT" | "MARKDOWN";
    }) => {
      return await apiClient<Source>(`/api/workspaces/${workspaceId}/sources`, {
        method: "POST",
        body: JSON.stringify({ title, content, type }),
      });
    },
    onSuccess: (newSource) => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
      if (newSource?.id) {
        setSelectedSourceIds((prev) => [...prev, newSource.id]);
      }
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      return await apiClient(
        `/api/workspaces/${workspaceId}/sources/${sourceId}`,
        {
          method: "DELETE",
        }
      );
    },
    onSuccess: (_, sourceId) => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
      setSelectedSourceIds((prev) => prev.filter((id) => id !== sourceId));
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (sourceIds: string[]) => {
      return await apiClient(
        `/api/workspaces/${workspaceId}/sources/bulk-delete`,
        {
          method: "POST",
          body: JSON.stringify({ sourceIds }),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
      setSelectedSourceIds([]);
    },
  });

  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const selectAllSources = () => {
    const allIds = sourcesQuery.data?.map((s) => s.id) || [];
    setSelectedSourceIds(allIds);
  };

  const deselectAllSources = () => {
    setSelectedSourceIds([]);
  };

  return {
    sources: sourcesQuery.data || [],
    isLoading: sourcesQuery.isLoading,
    isError: sourcesQuery.isError,
    error: sourcesQuery.error,
    refetch: sourcesQuery.refetch,
    selectedSourceIds,
    setSelectedSourceIds,
    toggleSourceSelection,
    selectAllSources,
    deselectAllSources,
    uploadPdf: (file: File, title?: string) =>
      uploadPdfMutation.mutateAsync({ file, title }),
    isUploadingPdf: uploadPdfMutation.isPending,
    importWebsite: (url: string, title?: string) =>
      importWebsiteMutation.mutateAsync({ url, title }),
    isImportingWebsite: importWebsiteMutation.isPending,
    importYoutube: (url: string, title?: string) =>
      importYoutubeMutation.mutateAsync({ url, title }),
    isImportingYoutube: importYoutubeMutation.isPending,
    createTextSource: (title: string, content: string) =>
      createTextSourceMutation.mutateAsync({ title, content }),
    isCreatingTextSource: createTextSourceMutation.isPending,
    deleteSource: deleteSourceMutation.mutateAsync,
    isDeleting: deleteSourceMutation.isPending,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
}
