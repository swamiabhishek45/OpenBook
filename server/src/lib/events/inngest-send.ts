import type { Inngest } from "inngest";
import { inngest } from "../../inngest/client.js";
import {
    isInngestConnectionError,
    shouldUseInngestCloud,
    shouldUseInngestDevServer,
} from "../../inngest/config.js";

type InngestSendPayload = Parameters<Inngest["send"]>[0];

/**
 * Sends an event to Inngest when dev server or opted-in Cloud is configured.
 * Returns false when the app should run the job in-process instead.
 */
export async function sendInngestEvent(
    payload: InngestSendPayload,
): Promise<boolean> {
    if (!shouldUseInngestCloud() && !shouldUseInngestDevServer()) {
        return false;
    }

    try {
        await inngest.send(payload);
        return true;
    } catch (error) {
        if (isInngestConnectionError(error)) {
            return false;
        }
        console.error("Inngest send failed:", error);
        throw error;
    }
}
