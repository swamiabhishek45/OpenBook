import {
    RAG_MIN_SCORE,
    RAG_RETRIEVE_K,
    RAG_TOP_K,
    RERANK_ENABLED,
} from "../ai-config.js";
import { embedQueryText } from "../openai.js";
import { queryWorkspaceVectors } from "../pinecone.js";
import {
    searchChunksByWorkspace,
    findChunksByWorkspaceId,
} from "../../repository/source-chunk.repository.js";
import { findSourcesByWorkspaceId } from "../../repository/source.repository.js";
import {
    reconcileRetrievedChunksWithSources,
    type RetrievedChunk,
} from "./reconcile.js";
import { rerankChunks } from "./rerank.js";

export type { RetrievedChunk };

export type RetrieveTiming = {
    embedQueryMs?: number;
    pineconeQueryMs?: number;
    rerankMs?: number;
    embedCacheHit?: boolean;
    embedTokens?: number;
};

function matchToChunk(
    match: { score?: number; metadata?: Record<string, unknown> },
): RetrievedChunk | null {
    const score = match.score ?? 0;
    const metadata = match.metadata;
    if (
        !metadata ||
        typeof metadata.sourceId !== "string" ||
        typeof metadata.sourceTitle !== "string" ||
        typeof metadata.sourceType !== "string" ||
        typeof metadata.chunkId !== "string" ||
        typeof metadata.text !== "string"
    ) {
        return null;
    }

    return {
        sourceId: metadata.sourceId,
        sourceTitle: metadata.sourceTitle,
        sourceType: metadata.sourceType,
        chunkId: metadata.chunkId,
        chunkIndex: Number(metadata.chunkIndex ?? 0),
        ...(typeof metadata.page === "number" ? { page: metadata.page } : {}),
        text: metadata.text,
        score,
        vectorScore: score,
    };
}

export async function retrieveWorkspaceCandidates(
    workspaceId: string,
    query: string,
    retrieveK: number = RAG_RETRIEVE_K,
    timing?: RetrieveTiming,
): Promise<RetrievedChunk[]> {
    const chunks: RetrievedChunk[] = [];

    try {
        const embedStart = performance.now();
        const { embedding, cacheHit, promptTokens } = await embedQueryText(query);
        if (timing) {
            timing.embedQueryMs = Math.round(performance.now() - embedStart);
            timing.embedCacheHit = cacheHit;
            timing.embedTokens = promptTokens;
        }

        if (embedding) {
            const pineconeStart = performance.now();
            const matches = await queryWorkspaceVectors(
                workspaceId,
                embedding,
                retrieveK,
            );
            if (timing) {
                timing.pineconeQueryMs = Math.round(
                    performance.now() - pineconeStart,
                );
            }

            for (const match of matches) {
                const chunk = matchToChunk({
                    score: match.score,
                    metadata: match.metadata as Record<string, unknown>,
                });
                if (chunk) {
                    chunks.push(chunk);
                }
            }
        }
    } catch (err) {
        console.warn(
            "Vector retrieval notice (falling back to database source search):",
            err,
        );
    }

    if (chunks.length > 0) {
        return reconcileRetrievedChunksWithSources(workspaceId, chunks);
    }

    return reconcileRetrievedChunksWithSources(
        workspaceId,
        await retrieveDatabaseFallback(workspaceId, query),
    );
}

async function retrieveDatabaseFallback(
    workspaceId: string,
    query: string,
): Promise<RetrievedChunk[]> {
    const chunks: RetrievedChunk[] = [];

    try {
        const queryTerms = query
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter((t) => t.length >= 3);

        const dbChunks = await searchChunksByWorkspace(
            workspaceId,
            queryTerms,
            RAG_TOP_K,
        );

        if (dbChunks.length > 0) {
            return dbChunks.map((chunk) => {
                const meta =
                    chunk.metadata &&
                    typeof chunk.metadata === "object" &&
                    !Array.isArray(chunk.metadata)
                        ? (chunk.metadata as Record<string, unknown>)
                        : {};

                return {
                    sourceId: chunk.sourceId,
                    sourceTitle: chunk.source.title,
                    sourceType: chunk.source.type,
                    chunkId: chunk.id,
                    chunkIndex: chunk.index,
                    page: typeof meta.page === "number" ? meta.page : undefined,
                    text: chunk.content,
                    score: 0.8,
                };
            });
        }

        const recentChunks = await findChunksByWorkspaceId(
            workspaceId,
            RAG_TOP_K,
        );
        if (recentChunks.length > 0) {
            return recentChunks.map((chunk) => {
                const meta =
                    chunk.metadata &&
                    typeof chunk.metadata === "object" &&
                    !Array.isArray(chunk.metadata)
                        ? (chunk.metadata as Record<string, unknown>)
                        : {};

                return {
                    sourceId: chunk.sourceId,
                    sourceTitle: chunk.source.title,
                    sourceType: chunk.source.type,
                    chunkId: chunk.id,
                    chunkIndex: chunk.index,
                    page: typeof meta.page === "number" ? meta.page : undefined,
                    text: chunk.content,
                    score: 0.5,
                };
            });
        }

        const sources = await findSourcesByWorkspaceId(workspaceId);
        const readySources = sources.filter(
            (s) => s.content && s.content.trim().length > 0,
        );
        for (const source of readySources.slice(0, 3)) {
            chunks.push({
                sourceId: source.id,
                sourceTitle: source.title,
                sourceType: source.type,
                chunkId: `${source.id}-root`,
                chunkIndex: 0,
                text: source.content!.slice(0, 2500),
                score: 0.5,
            });
        }
    } catch (fallbackErr) {
        console.warn("Database source retrieval fallback error:", fallbackErr);
    }

    return chunks;
}

export async function retrieveWorkspaceContext(
    workspaceId: string,
    query: string,
    timing?: RetrieveTiming,
): Promise<RetrievedChunk[]> {
    const candidates = await retrieveWorkspaceCandidates(
        workspaceId,
        query,
        RAG_RETRIEVE_K,
        timing,
    );

    if (candidates.length === 0) {
        return candidates;
    }

    let ranked = candidates;

    if (RERANK_ENABLED && process.env.COHERE_API_KEY?.trim()) {
        const rerankStart = performance.now();
        ranked = await rerankChunks(query, candidates, RAG_TOP_K);
        if (timing) {
            timing.rerankMs = Math.round(performance.now() - rerankStart);
        }
    } else {
        ranked = candidates
            .slice()
            .sort((a, b) => b.score - a.score)
            .slice(0, RAG_TOP_K);
    }

    return ranked.filter((chunk) => chunk.score >= RAG_MIN_SCORE);
}

export type UserMemoryContext = string;

export function buildChatSystemPrompt(input: {
    chunks: RetrievedChunk[];
    conversationSummary?: string | null;
    userMemories?: UserMemoryContext[];
    webSearchEnabled?: boolean;
}) {
    const sections: string[] = [
        "You are Chaibook, an assistant that helps users learn from their workspace sources.",
    ];

    if (input.webSearchEnabled) {
        sections.push(
            "You have access to a web_search tool for up-to-date information outside the workspace.",
            "Use it when the user asks about recent events or topics not covered by their sources.",
            "Cite web results inline using [W1], [W2], etc. matching the web result blocks.",
        );
    }

    if (input.userMemories?.length) {
        const memoryBlock = input.userMemories
            .map((memory) => `- ${memory}`)
            .join("\n");

        sections.push(
            "Known facts about this user (use when relevant):",
            memoryBlock,
        );
    }

    const summary = input.conversationSummary?.trim();
    if (summary) {
        sections.push("Earlier conversation summary:", summary);
    }

    if (input.chunks.length === 0) {
        sections.push(
            "This workspace has no indexed source content yet, or nothing relevant was retrieved.",
            input.webSearchEnabled
                ? "Use web search when needed, or answer from general knowledge."
                : "Answer helpfully from general knowledge and suggest adding or processing sources when appropriate.",
            "Do not invent citations.",
        );
        return sections.join("\n");
    }

    const context = input.chunks
        .map((chunk, index) => {
            const label = `[${index + 1}] ${chunk.sourceTitle} (${chunk.sourceType})${
                chunk.page ? `, page ${chunk.page}` : ""
            }`;
            return `${label}\n${chunk.text}`;
        })
        .join("\n\n");

    sections.push(
        "Use ONLY the retrieved context below when making factual claims about their materials.",
        "If the context is insufficient, say so clearly.",
        "Cite sources inline using [1], [2], etc. matching the numbered context blocks.",
        "Keep answers concise, accurate, and educational.",
        "",
        "Retrieved context:",
        context,
    );

    return sections.join("\n");
}
