import { findSourceSummariesByWorkspaceIdAndIds } from "../../repository/source.repository.js";
export type RetrievedChunk = {
    sourceId: string;
    sourceTitle: string;
    sourceType: string;
    chunkId: string;
    chunkIndex: number;
    page?: number;
    text: string;
    score: number;
};

type WorkspaceCitation = {
    sourceId?: string;
    sourceTitle: string;
    sourceType: string;
};

/**
 * Drops retrieved chunks whose source no longer exists and refreshes title/type from Postgres.
 */
export async function reconcileRetrievedChunksWithSources(
    workspaceId: string,
    chunks: RetrievedChunk[],
): Promise<RetrievedChunk[]> {
    if (chunks.length === 0) {
        return chunks;
    }

    const sourceIds = [...new Set(chunks.map((chunk) => chunk.sourceId))];
    const sources = await findSourceSummariesByWorkspaceIdAndIds(
        workspaceId,
        sourceIds,
    );
    const byId = new Map(sources.map((source) => [source.id, source]));

    return chunks
        .filter((chunk) => byId.has(chunk.sourceId))
        .map((chunk) => {
            const source = byId.get(chunk.sourceId)!;
            return {
                ...chunk,
                sourceTitle: source.title,
                sourceType: source.type,
            };
        });
}

/**
 * Removes workspace citations for deleted sources and refreshes titles from Postgres.
 * Web citations (no sourceId) are left unchanged.
 */
export async function reconcileWorkspaceCitations<T extends WorkspaceCitation>(
    workspaceId: string,
    citations: T[],
): Promise<T[]> {
    if (citations.length === 0) {
        return citations;
    }

    const workspaceCitations = citations.filter(
        (citation) =>
            citation.sourceId &&
            citation.sourceType !== "WEB",
    );
    const passthrough = citations.filter(
        (citation) =>
            !citation.sourceId || citation.sourceType === "WEB",
    );

    if (workspaceCitations.length === 0) {
        return citations;
    }

    const sourceIds = [
        ...new Set(
            workspaceCitations.map((citation) => citation.sourceId as string),
        ),
    ];
    const sources = await findSourceSummariesByWorkspaceIdAndIds(
        workspaceId,
        sourceIds,
    );
    const byId = new Map(sources.map((source) => [source.id, source]));

    const kept = workspaceCitations
        .filter((citation) => byId.has(citation.sourceId!))
        .map((citation) => {
            const source = byId.get(citation.sourceId!)!;
            return {
                ...citation,
                sourceTitle: source.title,
                sourceType: source.type,
            };
        });

    return [...kept, ...passthrough];
}
