import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { scrapeWebsite } from "../lib/sources/firecrawl.js";
import { extractPdfFromBuffer } from "../lib/sources/pdf.js";
import { enqueueSourceProcessing } from "../lib/events/source-events.js";
import { fetchYoutubeTranscript } from "../lib/sources/youtube.js";
import {
    createSourceRecord,
    deleteSourceRecord,
    findSourceByIdAndWorkspaceId,
    findSourcesByWorkspaceId,
    type SourceRecord,
} from "../repository/source.repository.js";
import { NotFoundError } from "../types/app-error.js";
import { CreateSourceInput, ImportWebsiteInput, ImportYoutubeInput, ListSourcesQuery } from "../validators/source.validator.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";
import { assertCanCreateSource } from "./usage.services.js";

/**
 * Verifies that the given user has read/write access to the specified workspace.
 *
 * @param workspaceId - Workspace identifier to verify
 * @param userId - Authenticated user's identifier
 * @throws {NotFoundError} When workspace does not exist or user lacks access
 */
async function assertWorkspaceAccess(workspaceId: string, userId: string) {
    await getWorkspaceByIdForUser(workspaceId, userId);
}

/**
 * Persists a source record in the database and enqueues an asynchronous background processing event via Inngest.
 *
 * @param data - Source creation payload including workspaceId, title, type, content, and metadata
 * @returns The newly created source record
 */
export async function createAndProcessSource(
    data: Parameters<typeof createSourceRecord>[0],
) {
    const source = await createSourceRecord(data);

    await enqueueSourceProcessing({
        sourceId: source.id,
        workspaceId: source.workspaceId,
    });

    return source;
}

/**
 * Lists all sources belonging to a workspace with optional filters (e.g. status, type).
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param filters - Optional query parameters to filter sources
 * @returns Array of source records matching the query
 */
export async function listSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    filters: ListSourcesQuery = {},
) {
    await assertWorkspaceAccess(workspaceId, userId);
    return findSourcesByWorkspaceId(workspaceId, filters);
}

/**
 * Fetches a single source by ID within the scope of a workspace.
 *
 * @param workspaceId - Target workspace identifier
 * @param sourceId - Source document identifier
 * @param userId - Authenticated user's identifier
 * @returns The requested source record
 * @throws {NotFoundError} If the source does not exist in the specified workspace
 */
export async function getSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
): Promise<SourceRecord> {
    await assertWorkspaceAccess(workspaceId, userId);

    const source = await findSourceByIdAndWorkspaceId(sourceId, workspaceId);

    if (!source) {
        throw new NotFoundError("Source not found");
    }

    return source;
}

/**
 * Deletes a single source document and its associated chunks from a workspace.
 *
 * @param workspaceId - Target workspace identifier
 * @param sourceId - Source document identifier to delete
 * @param userId - Authenticated user's identifier
 */
export async function deleteSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    await getSourceForWorkspace(workspaceId, sourceId, userId);
    await deleteSourceRecord(sourceId);
}

/**
 * Deletes multiple sources in batch from a workspace.
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param sourceIds - Array of source document identifiers to delete
 */
export async function bulkDeleteSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds: string[],
) {
    await assertWorkspaceAccess(workspaceId, userId);

    for (const sourceId of sourceIds) {
        await deleteSourceForWorkspace(workspaceId, sourceId, userId);
    }
}

/**
 * Ingests a raw text or markdown document into a workspace.
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param input - Payload containing source title, type, and text content
 * @returns The created and enqueued source record
 */
export async function createTextOrMarkdownSource(
    workspaceId: string,
    userId: string,
    input: CreateSourceInput,
) {
    await assertWorkspaceAccess(workspaceId, userId);
    await assertCanCreateSource(userId);

    return createAndProcessSource({
        workspaceId,
        type: input.type,
        title: input.title,
        content: input.content,
        status: "PENDING",
    });
}

/**
 * Scrapes a public website via Firecrawl and ingests its markdown content as a workspace source.
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param input - Payload containing target URL and optional custom title
 * @returns The created and enqueued source record
 */
export async function importWebsiteSource(
    workspaceId: string,
    userId: string,
    input: ImportWebsiteInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateSource(userId);

    const scraped = await scrapeWebsite(input.url);

    return createAndProcessSource({
        workspaceId,
        type: "WEBSITE",
        title: input.title || scraped.title || input.url,
        content: scraped.markdown,
        url: scraped.sourceUrl,
        status: "PENDING",
        metadata: {
            importedFrom: scraped.sourceUrl,
        },
    });
}

/**
 * Uploads a PDF file to Cloudinary, extracts its textual content and page count, and creates a source record.
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param file - Multer uploaded file containing buffer and original name
 * @param title - Optional custom title for the PDF source
 * @returns The created and enqueued source record
 */
export async function uploadPdfSource(
    workspaceId: string,
    userId: string,
    file: Express.Multer.File,
    title?: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateSource(userId);

    let content: string | null = null;
    let pageCount: number | undefined;

    try {
        const extracted = await extractPdfFromBuffer(file.buffer);
        content = extracted.text;
        pageCount = extracted.pageCount;
    } catch (parseErr) {
        console.warn("Direct PDF buffer extraction notice:", parseErr);
    }

    let uploadMetadata: Record<string, unknown> = {};
    try {
        const upload = await uploadPdfToCloudinary(
            file.buffer,
            file.originalname,
        );
        uploadMetadata = {
            fileUrl: upload.secureUrl,
            fileName: upload.originalFilename,
            fileSize: upload.bytes,
            publicId: upload.publicId,
            resourceType: upload.resourceType,
        };
    } catch (cloudErr) {
        console.warn("Cloudinary upload skipped or failed (PDF will still be indexed locally):", cloudErr);
        uploadMetadata = {
            fileName: file.originalname,
            fileSize: file.size,
        };
    }

    return createAndProcessSource({
        workspaceId,
        type: "PDF",
        title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
        content,
        status: "PENDING",
        metadata: {
            ...uploadMetadata,
            pageCount,
        },
    });
}

/**
 * Extracts transcripts and video metadata from a YouTube video URL and ingests it as a workspace source.
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param input - Payload containing YouTube URL and optional custom title
 * @returns The created and enqueued source record
 */
export async function importYoutubeSource(
    workspaceId: string,
    userId: string,
    input: ImportYoutubeInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateSource(userId);

    const transcript = await fetchYoutubeTranscript(input.url);

    return createAndProcessSource({
        workspaceId,
        type: "YOUTUBE",
        title: input.title?.trim() || transcript.title || `YouTube: ${transcript.videoId}`,
        content: transcript.content,
        url: input.url,
        status: "PENDING",
        metadata: {
            videoId: transcript.videoId,
            videoTitle: transcript.title,
        },
    });
}

/**
 * Ingests external web search results as a permanent website source in a workspace.
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param input - Web source parameters containing title, content, and original URL
 * @returns The created and enqueued source record
 */
export async function importWebSearchSource(
    workspaceId: string,
    userId: string,
    input: { title: string; content: string; url: string },
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateSource(userId);

    return createAndProcessSource({
        workspaceId,
        type: "WEBSITE",
        title: input.title,
        content: input.content,
        url: input.url,
        status: "PENDING",
        metadata: {
            importedFrom: input.url,
            isWebSearch: true,
        },
    });
}

/**
 * Triggers re-processing (re-extraction, re-chunking, and re-indexing) for a single source.
 *
 * @param workspaceId - Target workspace identifier
 * @param sourceId - Source identifier to reprocess
 * @param userId - Authenticated user's identifier
 * @returns Status confirmation object `{ reprocessed: true }`
 */
export async function reprocessSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    const source = await getSourceForWorkspace(workspaceId, sourceId, userId);

    await enqueueSourceProcessing({
        sourceId: source.id,
        workspaceId: source.workspaceId,
    });

    return { reprocessed: true };
}

/**
 * Triggers re-processing for all or a filtered subset of sources in a workspace.
 *
 * @param workspaceId - Target workspace identifier
 * @param userId - Authenticated user's identifier
 * @param sourceIds - Optional array of source IDs to restrict re-processing
 * @returns Count of sources submitted for re-processing
 */
export async function reprocessSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds?: string[],
) {
    await assertWorkspaceAccess(workspaceId, userId);

    const sources = await findSourcesByWorkspaceId(workspaceId);
    const targetSources = sourceIds?.length
        ? sources.filter((s) => sourceIds.includes(s.id))
        : sources;

    for (const source of targetSources) {
        await enqueueSourceProcessing({
            sourceId: source.id,
            workspaceId: source.workspaceId,
        });
    }

    return { reprocessed: targetSources.length };
}

/**
 * Fetches all indexed text chunks and token metadata associated with a specific source.
 *
 * @param workspaceId - Target workspace identifier
 * @param sourceId - Source identifier to retrieve chunks for
 * @param userId - Authenticated user's identifier
 * @returns Object containing sourceId, workspaceId, chunks list, and chunk count
 */
export async function getSourceChunksForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    await getSourceForWorkspace(workspaceId, sourceId, userId);
    const chunks = await (await import("../repository/source-chunk.repository.js")).findChunksBySourceId(sourceId);
    return {
        sourceId,
        workspaceId,
        chunks,
        count: chunks.length,
    };
}