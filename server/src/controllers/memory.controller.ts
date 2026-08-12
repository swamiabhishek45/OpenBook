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

export async function listMemories(req: Request, res: Response) {
    const memories = await listUserMemories(req.session.user.id);
    res.json(memories);
}

export async function createMemory(req: Request, res: Response) {
    const input = parseCreateBody(req.body);
    const memory = await createMemoryForUser(req.session.user.id, input);
    res.status(201).json(memory);
}

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

export async function deleteMemory(req: Request, res: Response) {
    const { memoryId } = parseMemoryId(req.params);
    await deleteUserMemory(memoryId);
    res.status(204).send();
}