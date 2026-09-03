import { ApiError, apiFetch } from "@/shared/lib/api";
import type {
    CreateSourceInput,
    ImportWebsiteInput,
    ImportYoutubeInput,
    Source,
    SourceChunksResponse,
    SourceFilters,
} from "./types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

function buildSourcesPath(workspaceId: string, filters?: SourceFilters) {
    const params = new URLSearchParams();

    if (filters?.q) {
        params.set("q", filters.q);
    }

    if (filters?.type) {
        params.set("type", filters.type);
    }

    if (filters?.status) {
        params.set("status", filters.status);
    }

    const query = params.toString();
    return `/api/workspaces/${workspaceId}/sources${query ? `?${query}` : ""}`;
}

export function listSources(workspaceId: string, filters?: SourceFilters) {
    return apiFetch<Source[]>(buildSourcesPath(workspaceId, filters));
}

export function getSource(workspaceId: string, sourceId: string) {
    return apiFetch<Source>(
        `/api/workspaces/${workspaceId}/sources/${sourceId}`,
    );
}

export function getSourceChunks(workspaceId: string, sourceId: string) {
    return apiFetch<SourceChunksResponse>(
        `/api/workspaces/${workspaceId}/sources/${sourceId}/chunks`,
    );
}

export function createSource(workspaceId: string, input: CreateSourceInput) {
    return apiFetch<Source>(`/api/workspaces/${workspaceId}/sources`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function importWebsiteSource(
    workspaceId: string,
    input: ImportWebsiteInput,
) {
    return apiFetch<Source>(
        `/api/workspaces/${workspaceId}/sources/import/website`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

export function importYoutubeSource(
    workspaceId: string,
    input: ImportYoutubeInput,
) {
    return apiFetch<Source>(
        `/api/workspaces/${workspaceId}/sources/import/youtube`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

export async function uploadPdfSource(
    workspaceId: string,
    file: File,
    title?: string,
) {
    const formData = new FormData();
    formData.append("file", file);

    if (title?.trim()) {
        formData.append("title", title.trim());
    }

    const response = await fetch(
        `${API_BASE_URL}/api/workspaces/${workspaceId}/sources/upload`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(
            response.status,
            (data as { error?: string } | null)?.error ?? "Upload failed",
            (data as { details?: unknown } | null)?.details,
        );
    }

    return data as Source;
}

export function deleteSource(workspaceId: string, sourceId: string) {
    return apiFetch<void>(
        `/api/workspaces/${workspaceId}/sources/${sourceId}`,
        { method: "DELETE" },
    );
}

export function bulkDeleteSources(workspaceId: string, sourceIds: string[]) {
    return apiFetch<void>(
        `/api/workspaces/${workspaceId}/sources/bulk-delete`,
        {
            method: "POST",
            body: JSON.stringify({ sourceIds }),
        },
    );
}

export function reprocessSources(
    workspaceId: string,
    sourceIds?: string[],
) {
    return apiFetch<{ reprocessed: number }>(
        `/api/workspaces/${workspaceId}/sources/reprocess`,
        {
            method: "POST",
            body: JSON.stringify(
                sourceIds?.length ? { sourceIds } : {},
            ),
        },
    );
}

export function reprocessSource(workspaceId: string, sourceId: string) {
    return apiFetch<{ reprocessed: boolean }>(
        `/api/workspaces/${workspaceId}/sources/${sourceId}/reprocess`,
        { method: "POST" },
    );
}

export function importWebSearchSource(
    workspaceId: string,
    input: { title: string; content: string; url: string },
) {
    return apiFetch<Source>(
        `/api/workspaces/${workspaceId}/sources/import/web-search`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

export function importGoogleDriveSource(
    workspaceId: string,
    fileId: string,
) {
    return apiFetch<Source>(
        `/api/workspaces/${workspaceId}/sources/import/google-drive`,
        {
            method: "POST",
            body: JSON.stringify({ fileId }),
        },
    );
}

export function importNotionSource(
    workspaceId: string,
    pageId: string,
) {
    return apiFetch<Source>(
        `/api/workspaces/${workspaceId}/sources/import/notion`,
        {
            method: "POST",
            body: JSON.stringify({ pageId }),
        },
    );
}

export function importGithubSource(
    workspaceId: string,
    input: { url: string; title?: string },
) {
    return apiFetch<Source>(
        `/api/workspaces/${workspaceId}/sources/import/github`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

