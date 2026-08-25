import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export const sourceChunkSelect = {
    id: true,
    sourceId: true,
    index: true,
    content: true,
    tokenCount: true,
    metadata: true,
    createdAt: true,
} as const;

export type SourceChunkRecord = Prisma.SourceChunkGetPayload<{
    select: typeof sourceChunkSelect;
}>;

export type CreateSourceChunkData = {
    sourceId: string;
    index: number;
    content: string;
    tokenCount?: number | null;
    metadata?: Prisma.InputJsonValue;
};

/**
 * Deletes all chunks associated with a specific source ID.
 *
 * @param sourceId - Unique identifier of the parent source
 * @returns Promise resolving to batch deletion count
 */
export function deleteChunksBySourceId(sourceId: string) {
    return prisma.sourceChunk.deleteMany({
        where: { sourceId },
    });
}

/**
 * Persists an array of text chunks into PostgreSQL inside a database transaction.
 *
 * @param chunks - Array of chunk records to create
 * @returns Promise resolving to created chunk records
 */
export function createSourceChunks(chunks: CreateSourceChunkData[]) {
    if (chunks.length === 0) {
        return Promise.resolve([]);
    }

    return prisma.$transaction(
        chunks.map((chunk) =>
            prisma.sourceChunk.create({
                data: {
                    sourceId: chunk.sourceId,
                    index: chunk.index,
                    content: chunk.content,
                    tokenCount: chunk.tokenCount ?? null,
                    metadata: chunk.metadata,
                },
                select: sourceChunkSelect,
            }),
        ),
    );
}

/**
 * Queries all text chunks belonging to a source, sorted by their original sequential index.
 *
 * @param sourceId - Unique identifier of the source
 * @returns Promise resolving to list of chunk records
 */
export function findChunksBySourceId(sourceId: string) {
    return prisma.sourceChunk.findMany({
        where: { sourceId },
        select: sourceChunkSelect,
        orderBy: { index: "asc" },
    });
}

/**
 * Fetches recent text chunks across all READY sources in a workspace.
 *
 * @param workspaceId - Workspace identifier
 * @param limit - Maximum number of chunks to return (defaults to 10)
 * @returns Promise resolving to chunk records with joined source metadata
 */
export function findChunksByWorkspaceId(workspaceId: string, limit = 10) {
    return prisma.sourceChunk.findMany({
        where: {
            source: {
                workspaceId,
                status: "READY",
            },
        },
        select: {
            ...sourceChunkSelect,
            source: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

/**
 * Searches chunks across all sources in a workspace by performing case-insensitive term matching in Postgres.
 * Used as fallback RAG retrieval when Pinecone vector search is unavailable.
 *
 * @param workspaceId - Workspace identifier
 * @param queryTerms - Array of keywords extracted from user prompt
 * @param limit - Maximum number of chunks to return (defaults to 6)
 * @returns Promise resolving to matched chunk records with parent source metadata
 */
export function searchChunksByWorkspace(workspaceId: string, queryTerms: string[], limit = 6) {
    const filters = queryTerms
        .filter((term) => term.length >= 2)
        .map((term) => ({
            content: {
                contains: term,
                mode: "insensitive" as const,
            },
        }));

    return prisma.sourceChunk.findMany({
        where: {
            source: {
                workspaceId,
            },
            ...(filters.length > 0 ? { OR: filters } : {}),
        },
        select: {
            ...sourceChunkSelect,
            source: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}