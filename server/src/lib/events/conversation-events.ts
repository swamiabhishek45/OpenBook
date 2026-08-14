import { inngest } from "../../inngest/client.js";


export async function enqueueConversationSummarize(input: {
    conversationId: string;
    userId: string;
}) {
    try {
        await inngest.send({
            name: "conversation/summarize",
            data: input,
        });
    } catch (err) {
        console.warn("Inngest enqueueConversationSummarize warning (Inngest server may be offline):", err);
    }
}