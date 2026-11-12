import { summarizeConversationById } from "../../services/conversation-memory.services.js";
import { sendInngestEvent } from "./inngest-send.js";


/**
 * Enqueues an asynchronous rolling conversation summary job via Inngest.
 *
 * @param input - Object containing conversationId and userId
 * @returns Resolves when event is sent to Inngest
 */
export async function enqueueConversationSummarize(input: {
    conversationId: string;
    userId: string;
}) {
    const accepted = await sendInngestEvent({
        name: "conversation/summarize",
        data: input,
    });

    if (!accepted) {
        void summarizeConversationById(
            input.conversationId,
            input.userId,
        ).catch((err) => {
            console.error(
                `Conversation summarize failed for ${input.conversationId}:`,
                err,
            );
        });
    }
}