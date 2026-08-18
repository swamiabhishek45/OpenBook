"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Check,
  ArrowUp,
} from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";

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
    desc: "Provide a comprehensive summary of all key concepts across my selected sources.",
    prompt:
      "Please provide a comprehensive and detailed summary of all key concepts across my selected sources.",
  },
  {
    icon: <FileSearch className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />,
    title: "Key takeaways & insights",
    desc: "Extract the top 5 most important takeaways with supporting evidence.",
    prompt:
      "What are the top 5 most important takeaways and insights from these documents? Explain each clearly.",
  },
  {
    icon: <HelpCircle className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />,
    title: "Find connections",
    desc: "What are the common themes and contrasting arguments across these documents?",
    prompt:
      "Analyze the connections, common themes, and contrasting viewpoints across my sources.",
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isConvMenuOpen, setIsConvMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const convMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as messages stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Track scroll position for go-to-top button
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setShowScrollTop(scrollContainerRef.current.scrollTop > 150);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteActiveChat = () => {
    if (currentConversationId) {
      if (confirm("Are you sure you want to delete this chat conversation?")) {
        onDeleteConversation(currentConversationId);
      }
    } else if (messages.length > 0) {
      if (confirm("Clear current chat messages?")) {
        onNewChat();
      }
    }
  };

  // Click outside to close conversation menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (convMenuRef.current && !convMenuRef.current.contains(e.target as Node)) {
        setIsConvMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentConv = conversations.find((c) => c.id === currentConversationId);

  return (
    <div className="h-full flex flex-col bg-background text-foreground relative select-text">
      {/* Top Chat Sub-header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border flex items-center justify-between bg-card/60 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground shrink-0 hidden sm:inline">
            Chat
          </span>

          {/* Custom Compact Conversation Selector Dropdown */}
          <div className="relative min-w-0 flex-1 max-w-[200px] sm:max-w-[240px]" ref={convMenuRef}>
            <button
              type="button"
              onClick={() => setIsConvMenuOpen(!isConvMenuOpen)}
              className="w-full flex items-center justify-between gap-1 px-2 py-1 bg-muted/80 hover:bg-muted border border-border rounded-lg text-xs text-foreground font-medium transition-colors cursor-pointer"
            >
              <span className="truncate text-left">
                {currentConv ? currentConv.title || "Untitled Chat" : "+ New Conversation"}
              </span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-muted-foreground shrink-0 transition-transform duration-200",
                  isConvMenuOpen && "rotate-180"
                )}
              />
            </button>

            {isConvMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 rounded-xl border border-border bg-card shadow-2xl p-1.5 z-40 animate-fadeIn space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsConvMenuOpen(false);
                    onNewChat();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                    !currentConversationId
                      ? "bg-foreground text-background font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Conversation</span>
                </button>

                {conversations.length > 0 && (
                  <div className="pt-1 border-t border-border max-h-52 overflow-y-auto space-y-0.5">
                    {conversations.map((c) => {
                      const isActive = c.id === currentConversationId;
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg group transition-colors cursor-pointer",
                            isActive
                              ? "bg-muted font-semibold text-foreground"
                              : "hover:bg-muted/60 text-foreground"
                          )}
                          onClick={() => {
                            setIsConvMenuOpen(false);
                            onSelectConversation(c.id);
                          }}
                        >
                          <span className="truncate flex-1 text-xs">{c.title || "Untitled Chat"}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {isActive && <Check className="w-3.5 h-3.5 text-foreground" />}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Delete this conversation?")) {
                                  onDeleteConversation(c.id);
                                }
                              }}
                              title="Delete chat"
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Header Action Buttons: Delete, New Chat */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Delete Active Chat Button */}
          {(currentConversationId || messages.length > 0) && (
            <button
              type="button"
              onClick={handleDeleteActiveChat}
              title="Delete conversation"
              className="flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Delete</span>
            </button>
          )}

          {/* New Chat Button */}
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden flex flex-col">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar"
        >
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

        {/* Go To Top Floating Button at Bottom Right */}
        {showScrollTop && messages.length > 0 && (
          <button
            type="button"
            onClick={scrollToTop}
            className="absolute bottom-3 right-4 z-20 w-8 h-8 rounded-full bg-card/95 hover:bg-muted border border-border text-foreground shadow-lg backdrop-blur-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer animate-fadeIn"
            title="Go to top"
            aria-label="Scroll to top of chat"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
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
