import type { UIMessage } from "ai";

export function getTextFromUIMessage(message: UIMessage) {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
}

export function getLastUserMessageText(messages: UIMessage[]) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message.role === "user") {
            const text = getTextFromUIMessage(message).trim();
            if (text) {
                return text;
            }
        }
    }

    return null;
}


export function buildConversationTitle(text: string) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) {
        return "New chat";
    }

    return normalized.length > 72
        ? `${normalized.slice(0, 72).trim()}…`
        : normalized;
}