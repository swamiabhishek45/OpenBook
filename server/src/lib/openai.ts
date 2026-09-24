import OpenAI from "openai";
import {
    CHAT_MODEL,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
} from "./ai-config.js";
import {
    buildQueryEmbedCacheKey,
    getCachedQueryEmbedding,
    setCachedQueryEmbedding,
} from "./rag/query-embed-cache.js";

let client: OpenAI | null = null;

function getClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    return client;
}

export type EmbedTextsResult = {
    embeddings: number[][];
    promptTokens: number;
};

/**
 * Generates vector embeddings for an array of input strings using OpenAI text-embedding-3-small.
 */
export async function embedTextsWithUsage(
    texts: string[],
): Promise<EmbedTextsResult> {
    if (texts.length === 0) {
        return { embeddings: [], promptTokens: 0 };
    }

    const sanitizedTexts = texts.map((t) =>
        t && t.length > 20000 ? t.slice(0, 20000) : (t || " "),
    );

    const response = await getClient().embeddings.create({
        model: EMBEDDING_MODEL,
        input: sanitizedTexts,
        dimensions: EMBEDDING_DIMENSIONS,
    });

    const embeddings = response.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);

    return {
        embeddings,
        promptTokens: response.usage?.prompt_tokens ?? 0,
    };
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedTextsWithUsage(texts);
    return embeddings;
}

export async function embedQueryText(query: string): Promise<{
    embedding: number[] | null;
    cacheHit: boolean;
    promptTokens: number;
}> {
    const cacheKey = buildQueryEmbedCacheKey(query);
    const cached = await getCachedQueryEmbedding(cacheKey);
    if (cached) {
        return { embedding: cached, cacheHit: true, promptTokens: 0 };
    }

    const { embeddings, promptTokens } = await embedTextsWithUsage([query]);
    const embedding = embeddings[0] ?? null;

    if (embedding) {
        await setCachedQueryEmbedding(cacheKey, embedding);
    }

    return { embedding, cacheHit: false, promptTokens };
}

/** Rough USD estimate for chat + embed tokens (dev observability). */
export function estimateChatCostUsd(
    model: string,
    input: { promptTokens?: number; completionTokens?: number; embedTokens?: number },
): number | undefined {
    const prompt = input.promptTokens ?? 0;
    const completion = input.completionTokens ?? 0;
    const embed = input.embedTokens ?? 0;

    if (prompt + completion + embed === 0) {
        return undefined;
    }

    const rates: Record<string, { in: number; out: number }> = {
        "gpt-4o-mini": { in: 0.15 / 1_000_000, out: 0.6 / 1_000_000 },
        "gpt-4o": { in: 2.5 / 1_000_000, out: 10 / 1_000_000 },
    };

    const rate = rates[model] ?? rates[CHAT_MODEL];
    const embedRate = 0.02 / 1_000_000;

    return (
        prompt * rate.in +
        completion * rate.out +
        embed * embedRate
    );
}
