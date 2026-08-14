import { apiFetch } from "@/shared/lib/api";
import type { AppMemory, CreateMemoryInput, UpdateMemoryInput } from "./types";

export function listMemories() {
  return apiFetch<AppMemory[]>("/api/memory");
}

export function createMemory(input: CreateMemoryInput) {
  return apiFetch<AppMemory>("/api/memory", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMemory(memoryId: string, input: UpdateMemoryInput) {
  return apiFetch<AppMemory>(`/api/memory/${memoryId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteMemory(memoryId: string) {
  return apiFetch<void>(`/api/memory/${memoryId}`, {
    method: "DELETE",
  });
}
