import type { Request, Response } from "express";
import { ValidationError } from "../types/app-error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";
import {
    bulkDeleteSourcesSchema,
    createSourceSchema,
    importWebsiteSchema,
    importYoutubeSchema,
    listSourcesQuerySchema,
    sourceIdParamSchema,
} from "../validators/source.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";
import {
    bulkDeleteSourcesForWorkspace,
    createTextOrMarkdownSource,
    deleteSourceForWorkspace,
    getSourceChunksForWorkspace,
    getSourceForWorkspace,
    importWebsiteSource,
    importWebSearchSource,
    importYoutubeSource,
    listSourcesForWorkspace,
    reprocessSourceForWorkspace,
    reprocessSourcesForWorkspace,
    uploadPdfSource,
} from "../services/source.services.js";
import { importWebSearchSchema, reprocessSourcesSchema } from "../validators/source.validator.js";

/**
 * Validates and extracts the `workspaceId` parameter from the request URL.
 *
 * @param params - Express request URL parameters
 * @returns Object containing validated workspaceId
 * @throws {ValidationError} When workspaceId validation fails
 */
function parseWorkspaceId(params: Request["params"]) {
    const parsed = workspaceIdParamSchema.safeParse(params);

    if (!parsed.success) {
        throw new ValidationError(
            "Invalid workspace id",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Validates and extracts `workspaceId` and `sourceId` parameters from the request URL.
 *
 * @param params - Express request URL parameters
 * @returns Object containing validated workspaceId and sourceId
 * @throws {ValidationError} When route parameters fail schema validation
 */
function parseSourceParams(params: Request["params"]) {
    const parsed = sourceIdParamSchema.safeParse(params);

    if (!parsed.success) {
        throw new ValidationError(
            "Invalid source id",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Validates and extracts source filtering query parameters (status, type).
 *
 * @param query - Express request query parameters object
 * @returns Validated list sources query filters
 * @throws {ValidationError} When query parameters fail schema validation
 */
function parseListQuery(query: Request["query"]) {
    const parsed = listSourcesQuerySchema.safeParse(query);

    if (!parsed.success) {
        throw new ValidationError(
            "Invalid query parameters",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Validates the request body for creating a raw text/markdown source.
 *
 * @param body - Raw request body
 * @returns Validated source creation payload
 * @throws {ValidationError} When creation payload fails validation
 */
function parseCreateBody(body: unknown) {
    const parsed = createSourceSchema.safeParse(body);

    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Validates the request body for bulk deleting source records.
 *
 * @param body - Raw request body
 * @returns Validated bulk delete payload with sourceIds array
 * @throws {ValidationError} When payload fails validation
 */
function parseBulkDeleteBody(body: unknown) {
    const parsed = bulkDeleteSourcesSchema.safeParse(body);

    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Handles HTTP GET request to list all sources in a workspace with optional filters.
 *
 * @param req - Express request with workspaceId param and query filters
 * @param res - Express response returning array of source records
 */
export async function listSources(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const filters = parseListQuery(req.query);
    const sources = await listSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        filters,
    );
    res.json(sources);
}

/**
 * Handles HTTP GET request to fetch details of a specific source.
 *
 * @param req - Express request with workspaceId and sourceId params
 * @param res - Express response returning source record
 */
export async function getSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    const source = await getSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(source);
}

/**
 * Handles HTTP POST request to create a text or markdown source document.
 *
 * @param req - Express request with creation payload
 * @param res - Express response returning 201 Created with source record
 */
export async function createSource(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = parseCreateBody(req.body);
    const source = await createTextOrMarkdownSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

/**
 * Handles HTTP DELETE request to delete a single source document.
 *
 * @param req - Express request with workspaceId and sourceId params
 * @param res - Express response returning 204 No Content
 */
export async function deleteSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    await deleteSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.status(204).send();
}

/**
 * Handles HTTP DELETE request to delete multiple sources in batch.
 *
 * @param req - Express request with workspaceId param and sourceIds array in body
 * @param res - Express response returning 204 No Content
 */
export async function bulkDeleteSources(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = parseBulkDeleteBody(req.body);
    await bulkDeleteSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        input.sourceIds,
    );
    res.status(204).send();
}

/**
 * Handles HTTP POST multipart file upload for ingesting a PDF source document.
 *
 * @param req - Express request containing uploaded file buffer in req.file
 * @param res - Express response returning 201 Created with source record
 * @throws {ValidationError} If no file was provided in the upload
 */
export async function uploadPdf(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);

    if (!req.file) {
        throw new ValidationError("PDF file is required");
    }

    const title =
        typeof req.body.title === "string" ? req.body.title : undefined;

    const source = await uploadPdfSource(
        workspaceId,
        req.session.user.id,
        req.file,
        title,
    );

    res.status(201).json(source);
}

/**
 * Handles HTTP POST request to scrape and ingest a public website URL via Firecrawl.
 *
 * @param req - Express request with workspaceId param and url in body
 * @param res - Express response returning 201 Created with source record
 */
export async function importWebsite(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = importWebsiteSchema.parse(req.body);
    const source = await importWebsiteSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

/**
 * Handles HTTP POST request to fetch transcripts and ingest a YouTube video.
 *
 * @param req - Express request with workspaceId param and YouTube URL in body
 * @param res - Express response returning 201 Created with source record
 */
export async function importYoutube(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = importYoutubeSchema.parse(req.body);
    const source = await importYoutubeSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

/**
 * Handles HTTP POST request to import external web search results as a website source.
 *
 * @param req - Express request with workspaceId param and web content in body
 * @param res - Express response returning 201 Created with source record
 */
export async function importWebSearch(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = importWebSearchSchema.parse(req.body);
    const source = await importWebSearchSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

/**
 * Handles HTTP POST request to re-extract, re-chunk, and re-embed a single source.
 *
 * @param req - Express request with workspaceId and sourceId params
 * @param res - Express response confirming reprocessing status
 */
export async function reprocessSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    const result = await reprocessSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(result);
}

/**
 * Handles HTTP POST request to batch re-process multiple or all sources in a workspace.
 *
 * @param req - Express request with workspaceId param and optional sourceIds array
 * @param res - Express response returning count of submitted sources
 */
export async function reprocessSources(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const parsed = reprocessSourcesSchema.safeParse(req.body);
    const sourceIds = parsed.success ? parsed.data.sourceIds : undefined;
    const result = await reprocessSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        sourceIds,
    );
    res.json(result);
}

/**
 * Handles HTTP GET request to fetch all indexed text chunks and token metadata for a source.
 *
 * @param req - Express request with workspaceId and sourceId params
 * @param res - Express response returning chunks list and chunk count
 */
export async function getSourceChunks(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    const result = await getSourceChunksForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(result);
}