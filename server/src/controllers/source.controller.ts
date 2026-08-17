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

export async function getSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    const source = await getSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(source);
}

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

export async function deleteSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    await deleteSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.status(204).send();
}

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

export async function reprocessSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    const result = await reprocessSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(result);
}

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

export async function getSourceChunks(req: Request, res: Response) {
    const { workspaceId, sourceId } = parseSourceParams(req.params);
    const result = await getSourceChunksForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(result);
}