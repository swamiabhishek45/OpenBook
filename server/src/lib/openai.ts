import OpenAI from "openai";
import {
    CHAT_MODEL,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
} from "./ai-config.js";

let client: OpenAI | null = null;

export async function embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
        return [];
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    // OpenAI text-embedding-3-small has an 8192 token limit per input string.
    // Ensure each string does not exceed ~20,000 characters.
    const sanitizedTexts = texts.map((t) =>
        t && t.length > 20000 ? t.slice(0, 20000) : (t || " ")
    );

    const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: sanitizedTexts,
        dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);
}