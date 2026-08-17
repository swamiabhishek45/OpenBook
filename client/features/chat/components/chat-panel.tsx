"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatMessage as ChatMessageType, Conversation } from "../types";
import {
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  BookOpen,
  FileSearch,
} from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";

interface ChatPanelProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
  onStopStreaming?: () => void;
  onNewChat: () => void;
  selectedSourcesCount: number;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: <BookOpen className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />,
    title: "Summarize sources",
    prompt: "Provide a comprehensive summary of all key concepts across my selected sources.",
  },
  {
    icon: <FileSearch className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />,
    title: "Key takeaways & insights",
    prompt: "Extract the top 5 most important takeaways with supporting evidence.",
  },
  {
    icon: <HelpCircle className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />,
    title: "Find connections",
    prompt: "What are the common themes and contrasting arguments across these documents?",
  },
];

export function ChatPanel({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  onNewChat,
  selectedSourcesCount,
  webSearchEnabled,
  onToggleWebSearch,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as messages stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="h-full flex flex-col bg-background text-foreground relative select-text">
      {/* Top Chat Sub-header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card/60">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Chat
          </span>

          {conversations.length > 0 && (
            <select
              value={currentConversationId || ""}
              onChange={(e) => onSelectConversation(e.target.value)}
              className="ml-2 px-2.5 py-1 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[200px] truncate cursor-pointer font-medium"
            >
              <option value="">+ New Conversation</option>
              {conversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || "Untitled Chat"}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentConversationId && (
            <button
              onClick={() => {
                if (confirm("Delete this conversation?")) {
                  onDeleteConversation(currentConversationId);
                }
              }}
              title="Delete conversation"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto  space-y-6 animate-fadeIn">
            {/* <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-xs"> */}
              <ThemeLoader size={86} />
            {/* </div> */}

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground tracking-tight">
                Ask anything about your notes &amp; sources
              </h3>
              {/* <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                OpenBook retrieves relevant excerpts directly from your indexed
                materials and synthesizes answers with source citations.
              </p> */}
            </div>

            {/* Starter Prompt Cards */}
            <div className="grid grid-cols-1 gap-2.5 w-full pt-2">
              {STARTER_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-zinc-400 dark:hover:border-zinc-600 text-left transition-all group shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {item.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              message={message}
              isLast={index === messages.length - 1}
              isStreaming={isStreaming}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <ChatInput
        onSendMessage={onSendMessage}
        onStopStreaming={onStopStreaming}
        isStreaming={isStreaming}
        selectedSourcesCount={selectedSourcesCount}
        webSearchEnabled={webSearchEnabled}
        onToggleWebSearch={onToggleWebSearch}
      />
    </div>
  );
}
