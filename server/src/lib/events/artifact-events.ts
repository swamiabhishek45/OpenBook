/**
 * Inngest event helpers for background artifact generation.
 */

import { inngest } from "../../inngest/client.js";

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
}) {
    await inngest.send({
        name: "artifact/generate",
        data: input,
    });
}