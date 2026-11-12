import { sendInngestEvent } from "./inngest-send.js";
import { processSourceById } from "../../services/source-processing-runner.js";

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
    const accepted = await sendInngestEvent({
        name: "source/created",
        data: input,
    });

    if (!accepted) {
        void processSourceById(input.sourceId).catch((err) => {
            console.error(
                `Source processing failed for ${input.sourceId}:`,
                err,
            );
        });
    }
}