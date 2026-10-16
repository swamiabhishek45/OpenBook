import { Inngest } from "inngest";
import { isInngestDevMode } from "./config.js";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "chaibooklm",
    isDev: isInngestDevMode(),
    eventKey: process.env.INNGEST_EVENT_KEY,
    signingKey: process.env.INNGEST_SIGNING_KEY,
});



export type SourceCreatedEvent = {
    name: "source/created",
    data: {
        sourceId: string;
    }
}

// Create an empty array where we'll export future Inngest functions
export const functions = [];