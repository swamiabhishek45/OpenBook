"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ChatMessage, Conversation } from "../types";

export function useChat(workspaceId: string, activeConversationId?: string) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
    activeConversationId
  );

  // Load conversations list
  const conversationsQuery = useQuery({
    queryKey: ["conversations", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await apiClient<Conversation[]>(
        `/api/workspaces/${workspaceId}/conversations`
      );
      return Array.isArray(res) ? res : [];
    },
    enabled: !!workspaceId,
  });

  // Load messages for current conversation if selected
  const messagesQuery = useQuery({
    queryKey: ["messages", workspaceId, currentConversationId],
    queryFn: async () => {
      if (!workspaceId || !currentConversationId) return [];
      const res = await apiClient<ChatMessage[]>(
        `/api/workspaces/${workspaceId}/conversations/${currentConversationId}/messages`
      );
      return Array.isArray(res) ? res : [];
    },
    enabled: !!workspaceId && !!currentConversationId,
  });

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(
        messagesQuery.data.map((m) => ({
          ...m,
          role: m.role.toLowerCase() as "user" | "assistant",
        }))
      );
    }
  }, [messagesQuery.data]);

  const deleteConversationMutation = useMutation({
    mutationFn: async (convId: string) => {
      return await apiClient(
        `/api/workspaces/${workspaceId}/conversations/${convId}`,
        {
          method: "DELETE",
        }
      );
    },
    onSuccess: (_, convId) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", workspaceId],
      });
      if (currentConversationId === convId) {
        setCurrentConversationId(undefined);
        setMessages([]);
      }
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const pendingAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
      setIsStreaming(true);

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

      try {
        const payloadMessages = [...messages, userMessage].map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          parts: [{ type: "text" as const, text: m.content }],
        }));

        const response = await fetch(
          `${API_BASE_URL}/api/workspaces/${workspaceId}/chat`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId: currentConversationId,
              messages: payloadMessages,
              webSearch: webSearchEnabled,
            }),
          }
        );

        const newConvId = response.headers.get("x-conversation-id");
        if (newConvId && newConvId !== currentConversationId) {
          setCurrentConversationId(newConvId);
          queryClient.invalidateQueries({
            queryKey: ["conversations", workspaceId],
          });
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Failed to stream chat response");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // The AI SDK stream protocol can send format like: 0:"text chunk"\n or raw lines
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.trim()) continue;

            if (line.startsWith("0:")) {
              try {
                // Remove prefix 0: and parse JSON string
                const jsonStr = line.slice(2);
                const text = JSON.parse(jsonStr);
                accumulated += text;
              } catch {
                accumulated += line.slice(2);
              }
            } else if (line.startsWith("d:")) {
              // Finish metadata part
            } else if (line.startsWith("e:") || line.startsWith("c:")) {
              // Extra metadata
            } else {
              accumulated += line;
            }
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulated }
                : msg
            )
          );
        }

        queryClient.invalidateQueries({
          queryKey: ["messages", workspaceId, currentConversationId],
        });
      } catch (err: unknown) {
        console.error("Chat stream error:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Error receiving AI response.";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    `⚠️ ${errorMsg}. Please ensure you have added and indexed sources, or retry.`,
                }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [
      messages,
      isStreaming,
      workspaceId,
      currentConversationId,
      webSearchEnabled,
      queryClient,
    ]
  );

  const startNewChat = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
  };

  return {
    messages,
    isStreaming,
    sendMessage,
    startNewChat,
    webSearchEnabled,
    setWebSearchEnabled,
    conversations: conversationsQuery.data || [],
    currentConversationId,
    setCurrentConversationId,
    deleteConversation: deleteConversationMutation.mutateAsync,
  };
}
