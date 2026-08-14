"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listMemories,
  createMemory,
  updateMemory,
  deleteMemory,
} from "../lib/api";
import type { CreateMemoryInput, UpdateMemoryInput } from "../lib/types";

export function useMemories() {
  const queryClient = useQueryClient();

  const memoriesQuery = useQuery({
    queryKey: ["memories"],
    queryFn: () => listMemories(),
  });

  const createMemoryMutation = useMutation({
    mutationFn: (input: CreateMemoryInput) => createMemory(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  const updateMemoryMutation = useMutation({
    mutationFn: ({
      memoryId,
      input,
    }: {
      memoryId: string;
      input: UpdateMemoryInput;
    }) => updateMemory(memoryId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (memoryId: string) => deleteMemory(memoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  return {
    memories: memoriesQuery.data || [],
    isLoading: memoriesQuery.isLoading,
    error: memoriesQuery.error,
    createMemory: createMemoryMutation,
    updateMemory: updateMemoryMutation,
    deleteMemory: deleteMemoryMutation,
  };
}
