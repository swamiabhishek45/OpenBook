import type { Request, Response } from "express";
import { deleteUserMemory, listUserMemories } from "../lib/mem0.js";
import {
    createMemoryForUser,
    updateMemoryForUser,
} from "../services/memory.services.js";
import { ValidationError } from "../types/app-error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";
import {
    createMemorySchema,
    memoryIdParamSchema,
    updateMemorySchema,
} from "../validators/memory.validator.js";

/**
 * Validates and extracts `memoryId` from Express request parameters.
 *
 * @param params - Express request URL parameters object
 * @returns Object containing validated memoryId
 * @throws {ValidationError} When memoryId validation fails
 */
function parseMemoryId(params: Request["params"]) {
    const parsed = memoryIdParamSchema.safeParse(params);

    if (!parsed.success) {
        throw new ValidationError(
            "Invalid memory id",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Validates the request body for creating a user memory.
 *
 * @param body - Raw request body
 * @returns Validated memory creation payload
 * @throws {ValidationError} When payload fails validation
 */
function parseCreateBody(body: unknown) {
    const parsed = createMemorySchema.safeParse(body);

    if (!parsed.success) {
        throw new ValidationError(
            "Invalid memory",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Validates the request body for updating a user memory.
 *
 * @param body - Raw request body
 * @returns Validated memory update payload
 * @throws {ValidationError} When payload fails validation
 */
function parseUpdateBody(body: unknown) {
    const parsed = updateMemorySchema.safeParse(body);

    if (!parsed.success) {
        throw new ValidationError(
            "Invalid memory",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

/**
 * Handles HTTP GET request to list all personalized long-term memories for the authenticated user from Mem0.
 *
 * @param req - Express request with session user
 * @param res - Express response returning array of memory items
 */
export async function listMemories(req: Request, res: Response) {
    const memories = await listUserMemories(req.session.user.id);
    res.json(memories);
}

/**
 * Handles HTTP POST request to explicitly author and save a new user memory.
 *
 * @param req - Express request with memory text in body
 * @param res - Express response returning 201 Created with saved memory record
 */
export async function createMemory(req: Request, res: Response) {
    const input = parseCreateBody(req.body);
    const memory = await createMemoryForUser(req.session.user.id, input);
    res.status(201).json(memory);
}

/**
 * Handles HTTP PATCH/PUT request to update the text of an existing memory.
 *
 * @param req - Express request with memoryId param and updated memory text
 * @param res - Express response returning updated memory record
 */
export async function updateMemory(req: Request, res: Response) {
    const { memoryId } = parseMemoryId(req.params);
    const input = parseUpdateBody(req.body);
    const memory = await updateMemoryForUser(
        req.session.user.id,
        memoryId,
        input,
    );
    res.json(memory);
}

/**
 * Handles HTTP DELETE request to delete a memory from Mem0.
 *
 * @param req - Express request with memoryId param
 * @param res - Express response returning 204 No Content
 */
export async function deleteMemory(req: Request, res: Response) {
    const { memoryId } = parseMemoryId(req.params);
    await deleteUserMemory(memoryId);
    res.status(204).send();
}