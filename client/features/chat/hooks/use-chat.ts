"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ChatMessage, Conversation } from "../types";
import { useChatPreferences } from "../stores/chat-preferences";
import { useUpgradeModal } from "@/features/billing";


export function useChat(workspaceId: string, activeConversationId?: string) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
    activeConversationId
  );
  const currentConversationIdRef = useRef<string | undefined>(activeConversationId);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    currentConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  const { getPrefs, setWebSearch } = useChatPreferences();
  const prefs = getPrefs(workspaceId);
  const webSearchEnabled = prefs.webSearch;

  const setWebSearchEnabled = useCallback(
    (enabled: boolean) => {
      setWebSearch(workspaceId, enabled);
    },
    [workspaceId, setWebSearch]
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
    if (messagesQuery.data && currentConversationId) {
      setMessages(
        messagesQuery.data.map((m) => ({
          ...m,
          role: m.role.toLowerCase() as "user" | "assistant",
        }))
      );
    }
  }, [messagesQuery.data, currentConversationId]);

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
        currentConversationIdRef.current = undefined;
        setCurrentConversationId(undefined);
        setMessages([]);
      }
    },
  });

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const activeConvId = currentConversationIdRef.current;
      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      const userMessage: ChatMessage = {
        id: userMessageId,
        conversationId: activeConvId || "",
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const pendingAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        conversationId: activeConvId || "",
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

      try {
        const payloadMessages = [...messages, userMessage].map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          parts: [{ type: "text" as const, text: m.content }],
        }));

        const currentPrefs = getPrefs(workspaceId);

        const response = await fetch(
          `${API_BASE_URL}/api/workspaces/${workspaceId}/chat`,
          {
            method: "POST",
            credentials: "include",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId: activeConvId,
              messages: payloadMessages,
              model: currentPrefs.model,
              webSearch: currentPrefs.webSearch,
            }),
          }
        );

        const newConvId =
          response.headers.get("x-conversation-id") ||
          response.headers.get("X-Conversation-Id");

        if (newConvId && newConvId !== currentConversationIdRef.current) {
          currentConversationIdRef.current = newConvId;
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
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed === "data: [DONE]") {
              continue;
            }

            if (trimmed.startsWith("data: ")) {
              try {
                const jsonStr = trimmed.slice(6);
                const data = JSON.parse(jsonStr);
                if (data.type === "text-delta" && typeof data.delta === "string") {
                  accumulated += data.delta;
                } else if (data.type === "text" && typeof data.text === "string") {
                  accumulated += data.text;
                }
              } catch {
                // Ignore incomplete SSE chunks
              }
            } else if (trimmed.startsWith("0:")) {
              try {
                const jsonStr = trimmed.slice(2);
                const text = JSON.parse(jsonStr);
                accumulated += text;
              } catch {
                accumulated += trimmed.slice(2);
              }
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

        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === "text-delta" && typeof data.delta === "string") {
                accumulated += data.delta;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulated }
                      : msg
                  )
                );
              }
            } catch {}
          }
        }

        queryClient.invalidateQueries({
          queryKey: ["conversations", workspaceId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-usage"],
        });
        if (currentConversationIdRef.current) {
          queryClient.invalidateQueries({
            queryKey: ["messages", workspaceId, currentConversationIdRef.current],
          });
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError" || (err instanceof DOMException && err.name === "AbortError")) {
          // Gracefully aborted by user clicking stop
          return;
        }
        console.error("Chat stream error:", err);
        const rawMsg = err instanceof Error ? err.message : "Error receiving AI response.";
        let errorMsg = rawMsg;
        const isLimitError =
          rawMsg.includes("limit reached") ||
          rawMsg.includes("LIMIT_REACHED") ||
          rawMsg.includes("403");

        if (isLimitError) {
          errorMsg = "Free chat limit reached (10 messages max). Please upgrade to Pro for unlimited chat.";
          useUpgradeModal.getState().openUpgradeModal({
            reason: "Free tier limit reached: Max 10 messages allowed. Upgrade to Pro for unlimited chat.",
            limitType: "messages",
          });
          queryClient.invalidateQueries({ queryKey: ["user-usage"] });
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    `⚠️ ${errorMsg}`,
                }
              : msg
          )
        );
      } finally {
        abortControllerRef.current = null;
        setIsStreaming(false);
      }

    },
    [
      messages,
      isStreaming,
      workspaceId,
      getPrefs,
      queryClient,
    ]
  );

  const startNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    currentConversationIdRef.current = undefined;
    setCurrentConversationId(undefined);
    setMessages([]);
  }, []);

  const selectConversation = useCallback((id: string | undefined) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    currentConversationIdRef.current = id;
    setCurrentConversationId(id);
    if (!id) {
      setMessages([]);
    }
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    startNewChat,
    webSearchEnabled,
    setWebSearchEnabled,
    conversations: conversationsQuery.data || [],
    currentConversationId,
    setCurrentConversationId: selectConversation,
    deleteConversation: deleteConversationMutation.mutateAsync,
  };
}

