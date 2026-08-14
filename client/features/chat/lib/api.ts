import { apiFetch } from "@/shared/lib/api";
import type { ChatMessage, Conversation } from "./types";

export function listConversations(workspaceId: string) {
    return apiFetch<Conversation[]>(
        `/api/workspaces/${workspaceId}/conversations`,
    );
}

export function createConversation(workspaceId: string, title?: string) {
    return apiFetch<Conversation>(
        `/api/workspaces/${workspaceId}/conversations`,
        {
            method: "POST",
            body: JSON.stringify(title ? { title } : {}),
        },
    );
}

export function listConversationMessages(
    workspaceId: string,
    conversationId: string,
) {
    return apiFetch<ChatMessage[]>(
        `/api/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
    );
}

export function deleteConversation(
    workspaceId: string,
    conversationId: string,
) {
    return apiFetch<void>(
        `/api/workspaces/${workspaceId}/conversations/${conversationId}`,
        { method: "DELETE" },
    );
}

export function parseCitations(value: unknown): ChatMessage["citations"] {
    if (!Array.isArray(value)) {
        return null;
    }

    return value.filter(
        (item): item is NonNullable<ChatMessage["citations"]>[number] =>
            typeof item === "object" &&
            item !== null &&
            (typeof (item as { sourceId?: unknown }).sourceId === "string" ||
             typeof (item as { url?: unknown }).url === "string") &&
            typeof (item as { sourceTitle?: unknown }).sourceTitle === "string",
    );
}
