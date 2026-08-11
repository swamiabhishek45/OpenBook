import type { PineconeRecord } from "@pinecone-database/pinecone";
import type { Prisma } from "../generated/prisma/client.js";
import { chunkPages, chunkText } from "../lib/chunking.js";
import { embedTexts } from "../lib/openai.js";
import { extractPdfFromCloudinary } from "../lib/pdf.js";
import {
    deleteSourceVectors,
    type VectorMetadata,
    upsertSourceVectors,
} from "../lib/pinecone.js";
import {
    createSourceChunks,
    deleteChunksBySourceId,
    findChunksBySourceId,
    type SourceChunkRecord,
} from "../repository/source-chunk.repository.js";
import {
    findSourceById,
    updateSourceRecord,
    type SourceRecord,
} from "../repository/source.repository.js";

type SourceMetadata = {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    publicId?: string;
    resourceType?: "raw" | "image";
    importedFrom?: string;
    videoId?: string;
    processingError?: string;
    chunkCount?: number;
    pageCount?: number;
    indexedAt?: string;
};

async function extractSourceText(source: SourceRecord) {
    const text = source.content?.trim();
    if (text) {
        return {
            text,
            pageCount: undefined,
            pages: undefined,
        };
    }

    if (source.type === "PDF") {
        const metadata =
            source.metadata &&
            typeof source.metadata === "object" &&
            !Array.isArray(source.metadata)
                ? (source.metadata as SourceMetadata)
                : {};
        if (!metadata.fileUrl) {
            throw new Error("PDF source is missing fileUrl metadata");
        }

        const extracted = await extractPdfFromCloudinary({
            fileUrl: metadata.fileUrl,
            publicId: metadata.publicId,
            resourceType: metadata.resourceType ?? "image",
        });
        return {
            text: extracted.text,
            pageCount: extracted.pageCount,
            pages: extracted.pages,
        };
    }

    throw new Error(`Source ${source.id} has no extractable content`);
}

export function markSourceProcessing(sourceId: string) {
    return updateSourceRecord(sourceId, { status: "PROCESSING" });
}

export async function markSourceFailed(
    sourceId: string,
    error: unknown,
    existingMetadata: SourceRecord["metadata"],
) {
    const message =
        error instanceof Error ? error.message : "Source processing failed";

    const metadata =
        existingMetadata &&
        typeof existingMetadata === "object" &&
        !Array.isArray(existingMetadata)
            ? (existingMetadata as SourceMetadata)
            : {};

    return updateSourceRecord(sourceId, {
        status: "FAILED",
        metadata: {
            ...metadata,
            processingError: message,
        },
    });
}

export async function extractSourceContent(sourceId: string) {
    const source = await findSourceById(sourceId);
    if (!source) {
        throw new Error("Source not found");
    }

    const extracted = await extractSourceText(source);
    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? (source.metadata as SourceMetadata)
            : {};

    await updateSourceRecord(sourceId, {
        content: extracted.text,
        metadata: {
            ...metadata,
            pageCount: extracted.pageCount ?? metadata.pageCount,
        },
    });

    return {
        sourceId,
        workspaceId: source.workspaceId,
        text: extracted.text,
        pages: extracted.pages,
        source,
    };
}

export async function chunkSourceContent(
    sourceId: string,
    text: string,
    pages?: string[],
) {
    await deleteChunksBySourceId(sourceId);

    const chunks = pages?.length ? chunkPages(pages) : chunkText(text);

    if (chunks.length === 0) {
        throw new Error("No chunks were generated from source content");
    }

    return createSourceChunks(
        chunks.map((chunk) => ({
            sourceId,
            index: chunk.index,
            content: chunk.content,
            tokenCount: Math.ceil(chunk.content.length / 4),
            metadata: chunk.metadata as Prisma.InputJsonValue | undefined,
        })),
    );
}

export async function removeSourceFromIndex(
    workspaceId: string,
    sourceId: string,
) {
    await deleteSourceVectors(workspaceId, sourceId);
    await deleteChunksBySourceId(sourceId);
}

/**
 * Returns all chunks for a source plus the total count.
 * Useful for debugging, admin UI, or verifying processing completed.
 *
 */
export async function listChunksForSource(sourceId: string) {
    const chunks = await findChunksBySourceId(sourceId);
    return { chunks, count: chunks.length };
}

/**
 * Step 3 of the pipeline: embed chunks and store vectors in Pinecone.
 *
 * - Sends chunk text to OpenAI in batches of 50
 * - Builds Pinecone records with embedding + searchable metadata
 * - Upserts vectors into the workspace namespace
 * - Marks source as `READY` with `chunkCount` and `indexedAt`
 *
 * Pinecone metadata includes enough context for retrieval without re-querying Postgres:
 * `sourceTitle`, `sourceType`, chunk `text` (truncated to 35k chars), and optional `page`.
 *
 * @param source - The parent source record
 * @param chunks - Chunk rows already saved in Postgres (must have `id`)
 * @returns Updated source record with status `READY`
 *
 *
 */

export async function embedAndIndexSource(
    source: SourceRecord,
    chunks: SourceChunkRecord[],
) {
    const batchSize = 50;
    const records: PineconeRecord<VectorMetadata>[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await embedTexts(batch.map((chunk) => chunk.content));

        for (let j = 0; j < batch.length; j += 1) {
            const chunk = batch[j]!;
            const embedding = embeddings[j]!;
            const chunkMetadata =
                chunk.metadata &&
                    typeof chunk.metadata === "object" &&
                    !Array.isArray(chunk.metadata)
                    ? (chunk.metadata as Record<string, unknown>)
                    : {};

            records.push({
                id: chunk.id,
                values: embedding,
                metadata: {
                    workspaceId: source.workspaceId,
                    sourceId: source.id,
                    chunkId: chunk.id,
                    chunkIndex: chunk.index,
                    sourceTitle: source.title,
                    sourceType: source.type,
                    text: chunk.content.slice(0, 35000),
                    ...(typeof chunkMetadata.page === "number"
                        ? { page: chunkMetadata.page }
                        : {}),
                },
            });
        }
    }

    await upsertSourceVectors(source.workspaceId, records);

    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? (source.metadata as SourceMetadata)
            : {};

    return updateSourceRecord(source.id, {
        status: "READY",
        metadata: {
            ...metadata,
            chunkCount: chunks.length,
            indexedAt: new Date().toISOString(),
            processingError: undefined,
        },
    });
}