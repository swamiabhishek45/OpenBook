/**
 * Inngest event helpers for background artifact generation.
 */

import { processArtifactById } from "../../services/artifact.services.js";
import { sendInngestEvent } from "./inngest-send.js";

/**
 * Enqueues an artifact generation job to run asynchronously via Inngest.
 *
 * @param input - Artifact and workspace ids for the worker
 * @returns Resolves when the event is accepted by Inngest
 *
 */
export async function enqueueArtifactGeneration(input: {
    artifactId: string;
    workspaceId: string;
}): Promise<boolean> {
    const accepted = await sendInngestEvent({
        name: "artifact/generate",
        data: input,
    });

    if (!accepted) {
        void processArtifactById(input.artifactId).catch((err) => {
            console.error(
                `Artifact generation failed for ${input.artifactId}:`,
                err,
            );
        });
    }

    return true;
}