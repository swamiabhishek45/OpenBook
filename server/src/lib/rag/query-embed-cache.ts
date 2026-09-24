import { createHash } from "node:crypto";
import {
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
    QUERY_EMBED_CACHE_TTL_SEC,
} from "../ai-config.js";
import prisma from "../db.js";

function normalizeQuery(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildQueryEmbedCacheKey(query: string): string {
    const payload = `${EMBEDDING_MODEL}:${EMBEDDING_DIMENSIONS}:${normalizeQuery(query)}`;
    return createHash("sha256").update(payload).digest("hex");
}

export async function getCachedQueryEmbedding(
    cacheKey: string,
): Promise<number[] | null> {
    const row = await prisma.queryEmbeddingCache.findUnique({
        where: { cacheKey },
    });

    if (!row || row.expiresAt.getTime() <= Date.now()) {
        if (row) {
            await prisma.queryEmbeddingCache
                .delete({ where: { cacheKey } })
                .catch(() => undefined);
        }
        return null;
    }

    if (!Array.isArray(row.embedding)) {
        return null;
    }

    const embedding = row.embedding.filter(
        (value): value is number => typeof value === "number",
    );

    return embedding.length > 0 ? embedding : null;
}

export async function setCachedQueryEmbedding(
    cacheKey: string,
    embedding: number[],
): Promise<void> {
    const expiresAt = new Date(Date.now() + QUERY_EMBED_CACHE_TTL_SEC * 1000);

    await prisma.queryEmbeddingCache.upsert({
        where: { cacheKey },
        create: {
            cacheKey,
            embedding,
            expiresAt,
        },
        update: {
            embedding,
            expiresAt,
        },
    });
}
