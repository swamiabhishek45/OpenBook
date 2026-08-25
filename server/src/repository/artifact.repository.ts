import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export const artifactSelect = {
    id: true,
    workspaceId: true,
    type: true,
    title: true,
    content: true,
    sourceIds: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type ArtifactRecord = Prisma.LearningArtifactGetPayload<{
    select: typeof artifactSelect;
}>;

export type CreateArtifactData = {
    workspaceId: string;
    type: ArtifactRecord["type"];
    title: string;
    sourceIds: string[];
    status?: ArtifactRecord["status"];
    metadata?: Prisma.InputJsonValue;
};

/**
 * Queries all learning artifacts in a workspace, ordered by newest first.
 *
 * @param workspaceId - Workspace identifier
 * @returns Promise resolving to list of artifact records
 */
export function findArtifactsByWorkspaceId(workspaceId: string) {
    return prisma.learningArtifact.findMany({
        where: { workspaceId },
        select: artifactSelect,
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Queries an artifact scoped by artifactId and workspaceId.
 *
 * @param artifactId - Unique identifier of the artifact
 * @param workspaceId - Workspace identifier
 * @returns Promise resolving to matching artifact record or null
 */
export function findArtifactByIdAndWorkspaceId(
    artifactId: string,
    workspaceId: string,
) {
    return prisma.learningArtifact.findFirst({
        where: { id: artifactId, workspaceId },
        select: artifactSelect,
    });
}

/**
 * Inserts a new learning artifact record (in PENDING status) into PostgreSQL.
 *
 * @param data - Artifact parameters (workspaceId, type, title, sourceIds, status, metadata)
 * @returns Promise resolving to created artifact record
 */
export function createArtifactRecord(data: CreateArtifactData) {
    return prisma.learningArtifact.create({
        data: {
            workspaceId: data.workspaceId,
            type: data.type,
            title: data.title,
            sourceIds: data.sourceIds,
            status: data.status ?? "PENDING",
            metadata: data.metadata,
        },
        select: artifactSelect,
    });
}

/**
 * Updates properties (title, generated JSON content, status, metadata) of an artifact record.
 *
 * @param artifactId - Unique identifier of the artifact
 * @param data - Update payload
 * @returns Promise resolving to updated artifact record
 */
export function updateArtifactRecord(
    artifactId: string,
    data: {
        title?: string;
        content?: Prisma.InputJsonValue;
        status?: ArtifactRecord["status"];
        metadata?: Prisma.InputJsonValue;
    },
) {
    return prisma.learningArtifact.update({
        where: { id: artifactId },
        data,
        select: artifactSelect,
    });
}

/**
 * Deletes an artifact record by ID from PostgreSQL.
 *
 * @param artifactId - Unique identifier of the artifact to delete
 */
export async function deleteArtifactRecord(artifactId: string) {
    await prisma.learningArtifact.delete({
        where: { id: artifactId },
    });
}

/**
 * Queries an artifact by its unique ID.
 *
 * @param artifactId - Unique identifier of the artifact
 * @returns Promise resolving to matching artifact record or null
 */
export function findArtifactById(artifactId: string) {
    return prisma.learningArtifact.findUnique({
        where: { id: artifactId },
        select: artifactSelect,
    });
}