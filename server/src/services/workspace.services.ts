// import { deleteWorkspaceVectors } from "../lib/pinecone.js";
import { deleteWorkspaceVectors } from "../lib/pinecone.js";
import {
    createWorkspaceRecord,
    deleteWorkspaceRecord,
    findWorkspaceByIdAndUserId,
    findWorkspacesByUserId,
    updateWorkspaceRecord,
    type WorkspaceRecord,
} from "../repository/workspace.repository.js";
import { NotFoundError } from "../types/app-error.js";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "../validators/workspace.validator.js";


/**
 * Lists all workspaces owned by the given user.
 *
 * @param userId - Unique identifier of the user
 * @returns Array of workspace records ordered by recent updates
 */
export function listWorkspacesByUser(userId: string) {
    return findWorkspacesByUserId(userId);
}

/**
 * Retrieves a single workspace by ID and verifies user ownership.
 *
 * @param workspaceId - Unique identifier of the workspace
 * @param userId - Authenticated user's identifier
 * @returns The matching workspace record
 * @throws {NotFoundError} When workspace does not exist or does not belong to user
 */
export async function getWorkspaceByIdForUser(
    workspaceId: string,
    userId: string,
): Promise<WorkspaceRecord> {
    const workspace = await findWorkspaceByIdAndUserId(workspaceId, userId);

    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }

    return workspace;
}

import { assertCanCreateWorkspace } from "./usage.services.js";

/**
 * Creates a new workspace for the user after verifying their subscription plan quota.
 *
 * @param userId - Authenticated user's identifier
 * @param input - Workspace creation payload (title, description, icon, defaultModel)
 * @returns Newly created workspace record
 * @throws {ForbiddenError} When maximum workspace limit for user's plan is reached
 */
export async function createWorkspaceForUser(
    userId: string,
    input: CreateWorkspaceInput,
) {
    await assertCanCreateWorkspace(userId);
    return createWorkspaceRecord(userId, input);
}

/**
 * Updates properties (title, description, icon, defaultModel) of an existing workspace.
 *
 * @param workspaceId - Workspace identifier to update
 * @param userId - Authenticated user's identifier
 * @param input - Update payload
 * @returns Updated workspace record
 */
export async function updateWorkspaceForUser(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    return updateWorkspaceRecord(workspaceId, input);
}

/**
 * Deletes a workspace, purges all its Pinecone vector embeddings, and cascades deletion across sources/artifacts.
 *
 * @param workspaceId - Workspace identifier to delete
 * @param userId - Authenticated user's identifier
 */
export async function deleteWorkspaceForUser(
    workspaceId: string,
    userId: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    try {
        await deleteWorkspaceVectors(workspaceId);
    } catch (error) {
        console.error("Failed to delete Pinecone namespace:", error);
    }

    await deleteWorkspaceRecord(workspaceId);
}