import type { Prisma } from "../generated/prisma/client.js";
import { enqueueArtifactGeneration } from "../lib/events/artifact-events.js";
import {
    createArtifactRecord,
    deleteArtifactRecord,
    findArtifactById,
    findArtifactByIdAndWorkspaceId,
    findArtifactsByWorkspaceId,
    updateArtifactRecord,
    type ArtifactRecord,
} from "../repository/artifact.repository.js";
import { NotFoundError } from "../types/app-error.js";
import {
    gatherSourceContext,
    generateArtifactContent,
} from "./artifact-generation.services.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";
import { assertCanCreateArtifact } from "./usage.services.js";
import type { CreateArtifactInput } from "../validators/artifact.validator.js";

/**
 * Lists all learning artifacts in a workspace.
 *
 * @param workspaceId - Workspace to list artifacts from
 * @param userId - Authenticated user's id
 * @returns Artifact records ordered by creation time
 *
 */
export async function listArtifactsForWorkspace(
    workspaceId: string,
    userId: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    return findArtifactsByWorkspaceId(workspaceId);
}

/**
 * Loads a single artifact after verifying workspace ownership.
 *
 * @param workspaceId - Workspace the artifact belongs to
 * @param artifactId - Artifact to fetch
 * @param userId - Authenticated user's id
 * @returns Artifact record with content when status is `READY`
 * @throws {NotFoundError} When the artifact does not exist in this workspace
 *
 */
export async function getArtifactForWorkspace(
    workspaceId: string,
    artifactId: string,
    userId: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const artifact = await findArtifactByIdAndWorkspaceId(
        artifactId,
        workspaceId,
    );

    if (!artifact) {
        throw new NotFoundError("Artifact not found");
    }

    return artifact;
}

/**
 * Creates a pending artifact and enqueues background generation via Inngest.
 *
 * Validates that ready sources exist before creating the row. The actual AI
 * generation runs asynchronously in {@link processArtifactById}.
 *
 * @param workspaceId - Workspace to attach the artifact to
 * @param userId - Authenticated user's id
 * @param input - Artifact type, optional title, optional source id filter
 * @returns New artifact with status `PENDING`
 * @throws {ValidationError} When no ready sources are available
 *
 */
export async function createArtifactForWorkspace(
    workspaceId: string,
    userId: string,
    input: CreateArtifactInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateArtifact(userId);


    const context = await gatherSourceContext(
        workspaceId,
        input.sourceIds,
    );

    const artifact = await createArtifactRecord({
        workspaceId,
        type: input.type,
        title:
            input.title ||
            `${
                {
                    SUMMARY: "Summary",
                    TAKEAWAYS: "Key Takeaways",
                    FLASHCARDS: "Flashcards",
                    QUIZ: "Quiz",
                    MINDMAP: "Mind Map",
                    REPORT: "AI Report",
                }[input.type]
            } · ${new Date().toLocaleDateString()}`,
        sourceIds: context.sourceIds,
        status: "PENDING",
    });

    await enqueueArtifactGeneration({
        artifactId: artifact.id,
        workspaceId,
    });

    return artifact;
}

/**
 * Deletes an artifact from the workspace.
 *
 * @param workspaceId - Workspace the artifact belongs to
 * @param artifactId - Artifact to delete
 * @param userId - Authenticated user's id
 * @returns Resolves when the artifact row is deleted
 * @throws {NotFoundError} When the artifact is not found
 *
 */
export async function deleteArtifactForWorkspace(
    workspaceId: string,
    artifactId: string,
    userId: string,
) {
    await getArtifactForWorkspace(workspaceId, artifactId, userId);
    await deleteArtifactRecord(artifactId);
}

/**
 * Runs the full artifact generation pipeline (used by Inngest worker).
 *
 * ```
 * status: PROCESSING
 *   → gatherSourceContext
 *   → generateArtifactContent
 *   → status: READY (or FAILED on error)
 * ```
 *
 * @param artifactId - Artifact to generate content for
 * @returns Updated artifact with `READY` status and generated content
 * @throws When the artifact is missing or generation fails (status set to `FAILED`)
 *
 *
 */
export async function processArtifactById(artifactId: string) {
    const artifact = await findArtifactById(artifactId);
    if (!artifact) {
        throw new Error("Artifact not found");
    }

    await updateArtifactRecord(artifactId, { status: "PROCESSING" });

    try {
        const context = await gatherSourceContext(
            artifact.workspaceId,
            artifact.sourceIds,
        );

        const content = await generateArtifactContent(
            artifact.type,
            context.text,
        );

        return updateArtifactRecord(artifactId, {
            status: "READY",
            content: content as Prisma.InputJsonValue,
            metadata: {
                generatedAt: new Date().toISOString(),
                processingError: undefined,
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Artifact generation failed";

        await updateArtifactRecord(artifactId, {
            status: "FAILED",
            metadata: {
                processingError: message,
            },
        });

        throw error;
    }
}

export type { ArtifactRecord };