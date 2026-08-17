import { RAG_MIN_SCORE, RAG_TOP_K } from "../ai-config.js";
import { embedTexts } from "../openai.js";
import { queryWorkspaceVectors } from "../pinecone.js";
import { searchChunksByWorkspace, findChunksByWorkspaceId } from "../../repository/source-chunk.repository.js";
import { findSourcesByWorkspaceId } from "../../repository/source.repository.js";

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

export async function retrieveWorkspaceContext(
    workspaceId: string,
    query: string,
): Promise<RetrievedChunk[]> {
    const chunks: RetrievedChunk[] = [];

    // 1. Try vector retrieval via Pinecone
    try {
        const [embedding] = await embedTexts([query]);
        if (embedding) {
            const matches = await queryWorkspaceVectors(
                workspaceId,
                embedding,
                RAG_TOP_K,
            );

            for (const match of matches) {
                const score = match.score ?? 0;
                if (score < RAG_MIN_SCORE) {
                    continue;
                }

                const metadata = match.metadata as
                    | Record<string, unknown>
                    | undefined;
                if (
                    !metadata ||
                    typeof metadata.sourceId !== "string" ||
                    typeof metadata.sourceTitle !== "string" ||
                    typeof metadata.sourceType !== "string" ||
                    typeof metadata.chunkId !== "string" ||
                    typeof metadata.text !== "string"
                ) {
                    continue;
                }

                chunks.push({
                    sourceId: metadata.sourceId,
                    sourceTitle: metadata.sourceTitle,
                    sourceType: metadata.sourceType,
                    chunkId: metadata.chunkId,
                    chunkIndex: Number(metadata.chunkIndex ?? 0),
                    ...(typeof metadata.page === "number"
                        ? { page: metadata.page }
                        : {}),
                    text: metadata.text,
                    score,
                });
            }
        }
    } catch (err) {
        console.warn("Vector retrieval notice (falling back to database source search):", err);
    }

    // 2. If vector retrieval found matches, return them
    if (chunks.length > 0) {
        return chunks;
    }

    // 3. Fallback: Search PostgreSQL source chunks directly
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

        // If no keyword matches, fetch recent chunks from this workspace
        const recentChunks = await findChunksByWorkspaceId(workspaceId, RAG_TOP_K);
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

        // 4. Last fallback: Read directly from sources that have content
        const sources = await findSourcesByWorkspaceId(workspaceId);
        const readySources = sources.filter((s) => s.content && s.content.trim().length > 0);
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