import type { UIMessage } from "ai";

/**
 * Extracts plain text from diverse AI SDK message representations (string, UIMessage.parts, content arrays).
 *
 * @param message - Message object or raw string payload from client
 * @returns Concatenated plain text content of the message
 */
export function getTextFromUIMessage(message: any): string {
    if (!message) return "";

    // If message.content is already a string
    if (typeof message.content === "string") {
        return message.content;
    }

    // If message.parts is an array (AI SDK UIMessage format)
    if (Array.isArray(message.parts)) {
        return message.parts
            .filter((part: any) => part && (part.type === "text" || typeof part.text === "string"))
            .map((part: any) => part.text || "")
            .join("");
    }

    // If message.content is an array of content parts
    if (Array.isArray(message.content)) {
        return message.content
            .filter((part: any) => part && (part.type === "text" || typeof part.text === "string"))
            .map((part: any) => part.text || (typeof part === "string" ? part : ""))
            .join("");
    }

    return "";
}

/**
 * Traverses message history backwards to find and extract the text of the most recent user message.
 *
 * @param messages - Array of message objects from client payload
 * @returns Text of the last user message, or null if not found
 */
export function getLastUserMessageText(messages: any[]): string | null {
    if (!Array.isArray(messages) || messages.length === 0) {
        return null;
    }

    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message && message.role === "user") {
            const text = getTextFromUIMessage(message).trim();
            if (text) {
                return text;
            }
        }
    }

    return null;
}

/**
 * Creates a clean, human-readable conversation title from the first user prompt (capped at 72 characters).
 *
 * @param text - First user message prompt text
 * @returns Cleaned title string
 */
export function buildConversationTitle(text: string): string {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) {
        return "New chat";
    }

    return normalized.length > 72
        ? `${normalized.slice(0, 72).trim()}…`
        : normalized;
}