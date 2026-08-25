import prisma from "../lib/db.js";
import type {
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
} from "../validators/workspace.validator.js";

export const workspaceSelect = {
    id: true,
    title: true,
    description: true,
    icon: true,
    defaultModel: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type WorkspaceRecord = {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
    defaultModel: string;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Queries all workspaces owned by a user, sorted by most recently updated.
 *
 * @param userId - Unique identifier of the user
 * @returns Promise resolving to a list of workspace records
 */
export function findWorkspacesByUserId(userId: string) {
    return prisma.workspace.findMany({
        where: { userId },
        select: workspaceSelect,
        orderBy: { updatedAt: "desc" },
    });
}

/**
 * Queries a single workspace record by ID and user ID.
 *
 * @param workspaceId - Unique identifier of the workspace
 * @param userId - Unique identifier of the user
 * @returns Promise resolving to matching workspace record or null
 */
export function findWorkspaceByIdAndUserId(
    workspaceId: string,
    userId: string,
) {
    return prisma.workspace.findFirst({
        where: { id: workspaceId, userId },
        select: workspaceSelect,
    });
}

/**
 * Inserts a new workspace record for a user in PostgreSQL.
 *
 * @param userId - Owner's user identifier
 * @param data - Workspace parameters (title, description, icon, defaultModel)
 * @returns Promise resolving to the newly created workspace record
 */
export function createWorkspaceRecord(
    userId: string,
    data: CreateWorkspaceInput,
) {
    return prisma.workspace.create({
        data: {
            userId,
            ...data,
        },
        select: workspaceSelect,
    });
}

/**
 * Updates properties of an existing workspace in PostgreSQL.
 *
 * @param workspaceId - Unique identifier of the workspace to update
 * @param data - Partial workspace update payload
 * @returns Promise resolving to the updated workspace record
 */
export function updateWorkspaceRecord(
    workspaceId: string,
    data: UpdateWorkspaceInput,
) {
    return prisma.workspace.update({
        where: { id: workspaceId },
        data,
        select: workspaceSelect,
    });
}

/**
 * Deletes a workspace record by ID from PostgreSQL.
 *
 * @param workspaceId - Unique identifier of the workspace to delete
 */
export async function deleteWorkspaceRecord(workspaceId: string) {
    await prisma.workspace.delete({
        where: { id: workspaceId },
    });
}