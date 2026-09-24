import { CITATION_FALLBACK_TOP_N } from "../ai-config.js";
import type { RetrievedChunk } from "./reconcile.js";

export type WorkspaceCitationRecord = {
    index?: number;
    sourceId: string;
    sourceTitle: string;
    sourceType: string;
    chunkId: string;
    chunkIndex: number;
    page?: number;
    excerpt: string;
    score?: number;
};

export type WebCitationRecord = {
    index?: number;
    sourceType: "WEB";
    sourceTitle: string;
    url: string;
    excerpt: string;
};

/**
 * Parses 1-based workspace citation indices from assistant text: [1], [2, 3], etc.
 * Ignores [Wn] web citations.
 */
export function parseWorkspaceCitationIndices(text: string): number[] {
    const indices = new Set<number>();
    const pattern = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        const inner = match[1];
        for (const part of inner.split(",")) {
            const n = Number.parseInt(part.trim(), 10);
            if (Number.isFinite(n) && n > 0) {
                indices.add(n);
            }
        }
    }

    return [...indices].sort((a, b) => a - b);
}

/** Parses 1-based web citation indices: [W1], [W2, W3]. */
export function parseWebCitationIndices(text: string): number[] {
    const indices = new Set<number>();
    const pattern = /\[W(\d+(?:\s*,\s*W?\d+)*)\]/gi;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        const inner = match[1];
        for (const part of inner.split(",")) {
            const cleaned = part.trim().replace(/^W/i, "");
            const n = Number.parseInt(cleaned, 10);
            if (Number.isFinite(n) && n > 0) {
                indices.add(n);
            }
        }
    }

    return [...indices].sort((a, b) => a - b);
}

export function resolveCitationsFromRetrieval(
    chunks: RetrievedChunk[],
    indices: number[],
): WorkspaceCitationRecord[] {
    const citations: WorkspaceCitationRecord[] = [];

    for (const index of indices) {
        const chunk = chunks[index - 1];
        if (!chunk) {
            continue;
        }

        citations.push({
            index,
            sourceId: chunk.sourceId,
            sourceTitle: chunk.sourceTitle,
            sourceType: chunk.sourceType,
            chunkId: chunk.chunkId,
            chunkIndex: chunk.chunkIndex,
            page: chunk.page,
            excerpt: chunk.text.slice(0, 280),
            score: chunk.score,
        });
    }

    return citations;
}

export function applyCitationFallback(
    chunks: RetrievedChunk[],
    parsed: WorkspaceCitationRecord[],
): WorkspaceCitationRecord[] {
    if (parsed.length > 0 || chunks.length === 0 || CITATION_FALLBACK_TOP_N <= 0) {
        return parsed;
    }

    const top = [...chunks]
        .sort((a, b) => b.score - a.score)
        .slice(0, CITATION_FALLBACK_TOP_N);

    return top.map((chunk, i) => ({
        index: i + 1,
        sourceId: chunk.sourceId,
        sourceTitle: chunk.sourceTitle,
        sourceType: chunk.sourceType,
        chunkId: chunk.chunkId,
        chunkIndex: chunk.chunkIndex,
        page: chunk.page,
        excerpt: chunk.text.slice(0, 280),
        score: chunk.score,
    }));
}

export function resolveWebCitationsFromResults(
    results: { title: string; url: string; content: string }[],
    indices: number[],
): WebCitationRecord[] {
    const citations: WebCitationRecord[] = [];

    for (const index of indices) {
        const result = results[index - 1];
        if (!result) {
            continue;
        }

        citations.push({
            index,
            sourceType: "WEB",
            sourceTitle: result.title,
            url: result.url,
            excerpt: result.content.slice(0, 280),
        });
    }

    return citations;
}
