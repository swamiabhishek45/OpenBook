"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createConversation,
    deleteConversation,
    listConversationMessages,
    listConversations,
    parseCitations,
} from "../lib/api";

export function chatKeys(workspaceId: string) {
    return {
        all: ["chat", workspaceId] as const,
        conversations: () => ["chat", workspaceId, "conversations"] as const,
        messages: (conversationId: string) =>
            ["chat", workspaceId, "messages", conversationId] as const,
    };
}

export function useConversations(workspaceId: string) {
    return useQuery({
        queryKey: chatKeys(workspaceId).conversations(),
        queryFn: () => listConversations(workspaceId),
        enabled: Boolean(workspaceId),
    });
}

export function useConversationMessages(
    workspaceId: string,
    conversationId: string | null,
) {
    return useQuery({
        queryKey: chatKeys(workspaceId).messages(conversationId ?? "none"),
        queryFn: () =>
            conversationId
                ? listConversationMessages(workspaceId, conversationId)
                : Promise.resolve([]),
        enabled: Boolean(workspaceId) && Boolean(conversationId),
    });
}

export function useCreateConversation(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (title?: string) =>
            createConversation(workspaceId, title),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: chatKeys(workspaceId).conversations(),
            });
        },
    });
}

export function useDeleteConversation(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) =>
            deleteConversation(workspaceId, conversationId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: chatKeys(workspaceId).all,
            });
        },
    });
}

export function buildCitationMap(messages: Awaited<ReturnType<typeof listConversationMessages>>) {
    const map: Record<string, NonNullable<ReturnType<typeof parseCitations>>> =
        {};

    for (const message of messages) {
        if (message.role === "ASSISTANT" || message.role === "assistant") {
            const citations = parseCitations(message.citations);
            if (citations?.length) {
                map[message.id] = citations;
            }
        }
    }

    return map;
}
