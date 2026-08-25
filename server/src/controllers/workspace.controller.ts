import type { Request, Response } from "express";
import {
    createWorkspaceForUser,
    deleteWorkspaceForUser,
    getWorkspaceByIdForUser,
    listWorkspacesByUser,
    updateWorkspaceForUser,
} from "../services/workspace.services.js";
import { ValidationError } from "../types/app-error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    workspaceIdParamSchema,
} from "../validators/workspace.validator.js";

/**
 * Validates and extracts the `workspaceId` URL parameter using Zod schema.
 *
 * @param params - Express request URL parameters object
 * @returns Parsed and validated workspaceId object
 * @throws {ValidationError} When workspaceId is invalid
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
 * Validates the request body for creating a new workspace.
 *
 * @param body - Raw request body
 * @returns Validated workspace creation payload
 * @throws {ValidationError} When payload fails validation constraints
 */
function parseCreateBody(body: unknown) {
    const parsed = createWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Validates the request body for updating an existing workspace.
 *
 * @param body - Raw request body
 * @returns Validated workspace update payload
 * @throws {ValidationError} When payload fails validation constraints
 */
function parseUpdateBody(body: unknown) {
    const parsed = updateWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Handles HTTP GET request to list all workspaces for the authenticated user.
 *
 * @param req - Express request with session user
 * @param res - Express response object
 */
export async function listWorkspaces(req: Request, res: Response) {
    const workspaces = await listWorkspacesByUser(req.session.user.id);
    res.json(workspaces);
}

/**
 * Handles HTTP GET request to retrieve a single workspace by ID.
 *
 * @param req - Express request containing workspaceId parameter
 * @param res - Express response object
 */
export async function getWorkspace(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const workspace = await getWorkspaceByIdForUser(
        workspaceId,
        req.session.user.id,
    );
    res.json(workspace);
}

/**
 * Handles HTTP POST request to create a new workspace.
 *
 * @param req - Express request with creation payload in body
 * @param res - Express response object returning 201 Created
 */
export async function createWorkspace(req: Request, res: Response) {
    const input = parseCreateBody(req.body);
    const workspace = await createWorkspaceForUser(
        req.session.user.id,
        input,
    );
    res.status(201).json(workspace);
}

/**
 * Handles HTTP PATCH/PUT request to update workspace details.
 *
 * @param req - Express request with workspaceId param and update payload
 * @param res - Express response object
 */
export async function updateWorkspace(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = parseUpdateBody(req.body);
    const workspace = await updateWorkspaceForUser(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.json(workspace);
}

/**
 * Handles HTTP DELETE request to delete a workspace and its assets.
 *
 * @param req - Express request with workspaceId parameter
 * @param res - Express response object returning 204 No Content
 */
export async function deleteWorkspace(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    await deleteWorkspaceForUser(workspaceId, req.session.user.id);
    res.status(204).send();
}