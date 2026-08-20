import { Inngest } from "inngest";
import "dotenv/config";

const isDev = process.env.NODE_ENV !== "production" && process.env.INNGEST_DEV === "1";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "chaibooklm",
    eventKey: process.env.INNGEST_EVENT_KEY,
    isDev,
});



export type SourceCreatedEvent = {
    name: "source/created",
    data: {
        sourceId: string;
    }
}

// Create an empty array where we'll export future Inngest functions
export const functions = [];