import { MemoryClient } from "mem0ai";

let client: MemoryClient | null = null;

/**
 * Returns a singleton Mem0 API client.
 *
 * @returns Configured `MemoryClient`
 * @throws When `MEM0_API_KEY` is missing
 */
export function getMem0Client() {
    const apiKey = process.env.MEM0_API_KEY?.trim();

    if (!apiKey) {
        throw new Error("MEM0_API_KEY is not configured");
    }

    if (!client) {
        client = new MemoryClient({ apiKey });
    }

    return client;
}

/** Message shape accepted by Mem0 for inferred memory extraction. */
export type Mem0Message = {
    role: "user" | "assistant";
    content: string;
};

/** Normalized memory record returned by Chaibook memory APIs. */
export type AppMemory = {
    id: string;
    memory: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown> | null;
    categories?: string[];
    source: "manual" | "learned";
};

/**
 * Maps a raw Mem0 record into the app's {@link AppMemory} shape.
 *
 * @param record - Raw Mem0 memory object
 * @returns Normalized memory with `source` derived from metadata
 */
function mapMemory(record: {
    id: string;
    memory?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    metadata?: Record<string, unknown> | null;
    categories?: string[];
}): AppMemory {
    const metadata = record.metadata ?? null;
    const source: AppMemory["source"] =
        metadata?.source === "manual" ? "manual" : "learned";
    const createdAt = record.createdAt ?? new Date().toISOString();
    const updatedAt = record.updatedAt ?? createdAt;

    return {
        id: record.id,
        memory: record.memory ?? "",
        createdAt:
            createdAt instanceof Date ? createdAt.toISOString() : createdAt,
        updatedAt:
            updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
        metadata,
        categories: record.categories,
        source,
    };
}

/**
 * Lists all memories stored for a user (up to 100).
 *
 * @param userId - Authenticated user's id
 * @returns Array of memories, or `[]` when Mem0 is not configured
 *
 */
export async function listUserMemories(userId: string) {
    if (!process.env.MEM0_API_KEY?.trim()) {
        return [];
    }

    const page = await getMem0Client().getAll({
        filters: { user_id: userId },
        page: 1,
        pageSize: 100,
    });

    return page.results.map(mapMemory);
}

/**
 * Semantic search over a user's memories for RAG chat context.
 *
 * @param userId - Authenticated user's id
 * @param query - Current user message or search text
 * @returns Top matching memories (up to 8), or `[]` when Mem0 is off or query is empty
 *
 */
export async function searchUserMemories(userId: string, query: string) {
    if (!process.env.MEM0_API_KEY?.trim() || !query.trim()) {
        return [];
    }

    const results = await getMem0Client().search(query, {
        filters: { user_id: userId },
        topK: 8,
        threshold: 0.1,
    });

    return results.results.map(mapMemory);
}

/**
 * Creates a single user memory (manual or explicit text).
 *
 * @param userId - Owner of the memory
 * @param input - Memory text, optional infer flag, optional metadata
 * @returns Created memory record
 * @throws When Mem0 returns no created record
 *
 */
export async function addUserMemory(
    userId: string,
    input: {
        memory: string;
        infer?: boolean;
        metadata?: Record<string, unknown>;
    },
) {
    const created = await getMem0Client().add(
        [{ role: "user", content: input.memory }],
        {
            userId,
            infer: input.infer ?? false,
            metadata: input.metadata,
        },
    );

    const first = created[0];
    if (!first) {
        throw new Error("Mem0 did not return a created memory");
    }

    return mapMemory(first);
}

/**
 * Extracts inferred memories from a conversation transcript (fire-and-forget in chat).
 *
 * @param userId - Owner of extracted memories
 * @param messages - Recent user/assistant turns
 * @param metadata - Optional metadata (e.g. `{ source: "learned", conversationId }`)
 * @returns Resolves immediately when Mem0 is off or messages are empty
 *
 */
export async function addMemoriesFromMessages(
    userId: string,
    messages: Mem0Message[],
    metadata?: Record<string, unknown>,
) {
    if (!process.env.MEM0_API_KEY?.trim() || messages.length === 0) {
        return;
    }

    await getMem0Client().add(messages, {
        userId,
        infer: true,
        metadata,
    });
}

/**
 * Updates the text of an existing memory by id.
 *
 * @param memoryId - Mem0 memory id
 * @param input - New memory text
 * @returns Updated memory record
 * @throws When Mem0 returns no updated record
 *
 */
export async function updateUserMemory(
    memoryId: string,
    input: { memory: string },
) {
    const updated = await getMem0Client().update(memoryId, {
        text: input.memory,
    });

    const first = updated[0];
    if (!first) {
        throw new Error("Mem0 did not return an updated memory");
    }

    return mapMemory(first);
}

/**
 * Permanently deletes a memory from Mem0.
 *
 * @param memoryId - Mem0 memory id to delete
 * @returns Resolves when deletion completes
 *
 */
export async function deleteUserMemory(memoryId: string) {
    await getMem0Client().delete(memoryId);
}