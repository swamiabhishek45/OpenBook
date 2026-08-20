import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "chaibooklm" });



export type SourceCreatedEvent = {
    name: "source/created",
    data: {
        sourceId: string;
    }
}

// Create an empty array where we'll export future Inngest functions
export const functions = [];