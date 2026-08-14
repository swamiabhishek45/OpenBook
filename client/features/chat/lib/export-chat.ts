import type { UIMessage } from "ai";
import type { ChatCitation, ChatMessage, Conversation } from "./types";

function getMessageText(message: UIMessage | ChatMessage): string {
    if ("parts" in message && Array.isArray((message as any).parts)) {
        return (message as any).parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("");
    }

    if ("content" in message && typeof message.content === "string") {
        return message.content;
    }

    return "";
}

function formatCitation(citation: ChatCitation) {
    if (citation.sourceType === "WEB" && citation.url) {
        return `- [${citation.sourceTitle}](${citation.url})\n  ${citation.excerpt}`;
    }

    const page =
        citation.page !== undefined ? `, page ${citation.page}` : "";
    return `- ${citation.sourceTitle} (${citation.sourceType}${page})\n  ${citation.excerpt}`;
}

export function exportConversationMarkdown(input: {
    conversation?: Conversation | null;
    messages: Array<UIMessage | ChatMessage>;
    citationsByMessageId?: Record<string, ChatCitation[]>;
}) {
    const title = input.conversation?.title ?? "Chat export";
    const lines = [
        `# ${title}`,
        "",
        `_Exported ${new Date().toLocaleString()}_`,
        "",
    ];

    for (const message of input.messages) {
        const role =
            ("role" in message ? message.role : "user").toLowerCase() === "user"
                ? "You"
                : "Assistant";
        lines.push(`## ${role}`, "", getMessageText(message), "");

        const messageId = "id" in message ? message.id : undefined;
        const citations =
            messageId && input.citationsByMessageId
                ? input.citationsByMessageId[messageId]
                : "citations" in message
                  ? message.citations
                  : null;

        if (citations?.length) {
            lines.push("### Sources", "");
            for (const citation of citations) {
                lines.push(formatCitation(citation));
            }
            lines.push("");
        }
    }

    return lines.join("\n");
}

export function downloadMarkdown(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}
