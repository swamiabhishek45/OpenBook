import {
    Pinecone,
    type Index,
    type PineconeRecord,
} from "@pinecone-database/pinecone";
import { EMBEDDING_DIMENSIONS } from "./ai-config.js";

const indexName = process.env.PINECONE_INDEX ?? "chaibook";

let pineconeClient: Pinecone | null = null;
let indexReady = false; // index = database

/**
 * Returns a singleton Pinecone client.
 *
 * @throws When `PINECONE_API_KEY` is missing
 */
function getPineconeClient() {
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("PINECONE_API_KEY is not configured");
    }

    if (!pineconeClient) {
        pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    }

    return pineconeClient;
}

/**
 * Polls until a newly created Pinecone index reports ready status.
 *
 * @param name - Index name to wait on
 * @throws When the index is not ready after 30 attempts (~60s)
 */
async function waitForIndexReady(name: string) {
    const client = getPineconeClient();

    for (let attempt = 0; attempt < 30; attempt += 1) {
        const description = await client.describeIndex(name);
        if (description.status?.ready) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error(`Pinecone index "${name}" did not become ready in time`);
}

/**
 * Ensures the Pinecone index exists and is ready (creates it on first run if missing).
 *
 * @returns Resolves when the index is available
 *
 */
export async function ensurePineconeIndex() {
    if (indexReady) {
        return;
    }

    const client = getPineconeClient();
    const indexes = await client.listIndexes();
    const exists = indexes.indexes?.some((index) => index.name === indexName);

    if (!exists) {
        await client.createIndex({
            name: indexName,
            dimension: EMBEDDING_DIMENSIONS,
            metric: "cosine",
            spec: {
                serverless: {
                    cloud: "aws",
                    region: "us-east-1",
                },
            },
        });
        await waitForIndexReady(indexName);
    }

    indexReady = true;
}

/**
 * Returns the configured Pinecone index handle.
 *
 * @returns Pinecone `Index` instance
 *
 */
export async function getPineconeIndex(): Promise<Index> {
    await ensurePineconeIndex();
    return getPineconeClient().index({name:indexName});
}

/** Metadata stored on each Pinecone vector for RAG retrieval and citations. */
export type VectorMetadata = {
    workspaceId: string;
    sourceId: string;
    chunkId: string;
    chunkIndex: number;
    sourceTitle: string;
    sourceType: string;
    text: string;
    page?: number;
};

/**
 * Upserts source chunk vectors into a workspace namespace in batches of 100.
 *
 * @param workspaceId - Pinecone namespace (one per workspace)
 * @param records - Vector records with embeddings and metadata
 * @returns Resolves immediately when `records` is empty
 *
 */
export async function upsertSourceVectors(
    workspaceId: string,
    records: PineconeRecord<VectorMetadata>[],
) {
    if (records.length === 0) {
        return;
    }

    const index = await getPineconeIndex();
    const namespace = index.namespace(workspaceId);

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
        await namespace.upsert({ records: records.slice(i, i + batchSize) });
    }
}

/**
 * Deletes all vectors belonging to a source within a workspace namespace.
 *
 * @param workspaceId - Pinecone namespace
 * @param sourceId - Source whose vectors should be removed
 * @returns Resolves when deletion completes
 *
 */
export async function deleteSourceVectors(
    workspaceId: string,
    sourceId: string,
) {
    const index = await getPineconeIndex();
    await index.namespace(workspaceId).deleteMany({
        filter: { sourceId: { $eq: sourceId } },
    });
}

/**
 * Deletes an entire workspace namespace (all vectors for that workspace).
 *
 * Called when a workspace is deleted.
 *
 * @param workspaceId - Pinecone namespace to wipe
 * @returns Resolves when all vectors in the namespace are deleted
 *
 */
export async function deleteWorkspaceVectors(workspaceId: string) {
    const index = await getPineconeIndex();
    await index.namespace(workspaceId).deleteAll();
}

/**
 * Queries a workspace namespace for the most similar vectors to a query embedding.
 *
 * @param workspaceId - Pinecone namespace to search
 * @param vector - Query embedding (1536 dimensions)
 * @param topK - Maximum number of matches to return
 * @returns Pinecone match objects with scores and metadata
 *
 */
export async function queryWorkspaceVectors(
    workspaceId: string,
    vector: number[],
    topK: number,
) {
    const index = await getPineconeIndex();
    const result = await index.namespace(workspaceId).query({
        vector,
        topK,
        includeMetadata: true,
    });

    return result.matches ?? [];
}

export { indexName as PINECONE_INDEX_NAME };