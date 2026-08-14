

import { inngest } from "../../inngest/client.js";

/**
 * Enqueues a source processing job to run asynchronously via Inngest.
 *
 * The worker runs extract → chunk → embed → Pinecone upsert.
 *
 * @param input - Source and workspace ids for the processing worker
 * @returns Resolves when the event is accepted by Inngest
 *
 */
export async function enqueueSourceProcessing(input: {
    sourceId: string;
    workspaceId: string;
}) {
    try {
        await inngest.send({
            name: "source/created",
            data: input,
        });
    } catch (err) {
        console.warn("Inngest enqueueSourceProcessing warning (Inngest server may be offline):", err);
    }
}