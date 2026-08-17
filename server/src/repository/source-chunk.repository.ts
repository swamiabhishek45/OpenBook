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

export function deleteChunksBySourceId(sourceId: string) {
    return prisma.sourceChunk.deleteMany({
        where: { sourceId },
    });
}

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

export function findChunksBySourceId(sourceId: string) {
    return prisma.sourceChunk.findMany({
        where: { sourceId },
        select: sourceChunkSelect,
        orderBy: { index: "asc" },
    });
}

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