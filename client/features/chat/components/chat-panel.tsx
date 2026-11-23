"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatMessage as ChatMessageType, Conversation } from "../types";
import {
  MessageSquare,
  Plus,
  Trash2,
  HelpCircle,
  BookOpen,
  FileSearch,
  ChevronDown,
  Check,
  ArrowUp,
} from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  POPOVER,
  POPOVER_ITEM,
  PanelLabel,
  PillButton,
  iconButtonClassName,
} from "@/components/ui/pill";
import { cn } from "@/lib/utils";

type ChatConfirmAction = "clear" | "delete" | null;

interface ChatPanelProps {
  workspaceId: string;
  defaultModel?: string;
  onModelChange?: (model: string) => void;
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
  onDeleteConversation: (id: string) => void | Promise<void>;
  onClearConversation: (id: string) => void | Promise<void>;
}

const STARTER_PROMPTS = [
  {
    icon: <BookOpen className="size-4 text-foreground" />,
    title: "Summarize sources",
    desc: "Provide a comprehensive summary of all key concepts across my selected sources.",
    prompt:
      "Please provide a comprehensive and detailed summary of all key concepts across my selected sources.",
  },
  {
    icon: <FileSearch className="size-4 text-foreground" />,
    title: "Key takeaways & insights",
    desc: "Extract the top 5 most important takeaways with supporting evidence.",
    prompt:
      "What are the top 5 most important takeaways and insights from these documents? Explain each clearly.",
  },
  {
    icon: <HelpCircle className="size-4 text-foreground" />,
    title: "Find connections",
    desc: "What are the common themes and contrasting arguments across these documents?",
    prompt:
      "Analyze the connections, common themes, and contrasting viewpoints across my sources.",
  },
];

export function ChatPanel({
  workspaceId,
  defaultModel,
  onModelChange,
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
  onClearConversation,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isConvMenuOpen, setIsConvMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ChatConfirmAction>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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

  const closeConfirmDialog = () => {
    setConfirmAction(null);
    setPendingDeleteId(null);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "clear") {
      if (currentConversationId) {
        await onClearConversation(currentConversationId);
      } else {
        onNewChat();
      }
    } else if (confirmAction === "delete" && pendingDeleteId) {
      await onDeleteConversation(pendingDeleteId);
      setIsConvMenuOpen(false);
    }
    closeConfirmDialog();
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
    <div className="relative flex h-full flex-col bg-background text-foreground select-text">
      {/* Top chat sub-header */}
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="hidden shrink-0 sm:block">
            <PanelLabel>Chat</PanelLabel>
          </span>

          {/* Conversation selector */}
          <div className="relative min-w-0 flex-1 sm:max-w-[260px]" ref={convMenuRef}>
            <button
              type="button"
              onClick={() => setIsConvMenuOpen(!isConvMenuOpen)}
              aria-expanded={isConvMenuOpen}
              aria-haspopup="menu"
              className="flex h-9 w-full cursor-pointer items-center justify-between gap-1.5 rounded-full bg-muted/70 px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none dark:bg-muted/50 dark:hover:bg-muted/80"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-left">
                  {currentConv ? currentConv.title || "Untitled chat" : "New conversation"}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                  isConvMenuOpen && "rotate-180"
                )}
              />
            </button>

            {isConvMenuOpen && (
              <div
                className={cn(
                  POPOVER,
                  "animate-fadeIn absolute top-full left-0 z-40 mt-2 w-64 sm:w-72"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsConvMenuOpen(false);
                    onNewChat();
                  }}
                  className={cn(
                    POPOVER_ITEM,
                    !currentConversationId
                      ? "bg-foreground font-semibold text-background"
                      : "text-foreground hover:bg-foreground/6"
                  )}
                >
                  <Plus className="size-4" />
                  <span>New conversation</span>
                </button>

                {conversations.length > 0 && (
                  <div className="mt-1 max-h-52 space-y-0.5 overflow-y-auto border-t border-border/60 pt-1">
                    {conversations.map((c) => {
                      const isActive = c.id === currentConversationId;
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            POPOVER_ITEM,
                            "group justify-between",
                            isActive
                              ? "bg-muted font-semibold text-foreground"
                              : "text-foreground hover:bg-foreground/6"
                          )}
                          onClick={() => {
                            setIsConvMenuOpen(false);
                            onSelectConversation(c.id);
                          }}
                        >
                          <span className="flex-1 truncate">{c.title || "Untitled chat"}</span>
                          <span className="flex shrink-0 items-center gap-0.5">
                            {isActive && <Check className="size-3.5 text-foreground" />}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDeleteId(c.id);
                                setConfirmAction("delete");
                              }}
                              title="Delete chat"
                              aria-label={`Delete ${c.title || "untitled chat"}`}
                              className={cn(
                                iconButtonClassName({ tone: "danger", size: "sm" }),
                                "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                              )}
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {(currentConversationId || messages.length > 0) && (
            <PillButton
              variant="danger"
              size="xs"
              onClick={() => setConfirmAction("clear")}
              title="Clear all messages in this chat"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden md:inline">Clear</span>
            </PillButton>
          )}

          <PillButton variant="chip" size="xs" onClick={onNewChat}>
            <Plus className="size-3.5" strokeWidth={2.4} />
            <span className="hidden sm:inline">New chat</span>
          </PillButton>
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

          <div className="animate-fadeIn mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
            <ThemeLoader size={76} />

            <h3 className="mt-6 text-[clamp(22px,2.6vw,30px)] leading-[1.18] font-semibold tracking-[-0.03em] text-balance">
              Ask anything about{" "}
              {/* Fades from ink to muted, as the landing headlines do. */}
              <span className="bg-linear-to-b from-foreground from-30% to-muted-foreground/55 bg-clip-text pb-[0.08em] text-transparent">
                your sources.
              </span>
            </h3>

            <p className="mt-2.5 max-w-[360px] text-[14.5px] leading-[1.55] text-muted-foreground">
              Every answer lists the passages it used. Start from one of these, or
              type your own.
            </p>

            <div className="mt-8 grid w-full grid-cols-1 gap-2">
              {STARTER_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(item.prompt)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-[18px] bg-muted/60 p-3.5 text-left dark:bg-muted/70",
                    "transition-[background-color,transform] duration-200 ease-out hover:bg-muted active:scale-[0.99]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-card shadow-[0_1px_2px_rgb(0_0_0/0.05)]"
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                      {item.desc}
                    </span>
                  </span>
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
            className={cn(
              iconButtonClassName({ tone: "card" }),
              "animate-fadeIn absolute right-4 bottom-3 z-20 backdrop-blur-sm"
            )}
            title="Go to top"
            aria-label="Scroll to top of chat"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>


      {/* Input Bar */}
      <ChatInput
        workspaceId={workspaceId}
        defaultModel={defaultModel}
        onModelChange={onModelChange}
        onSendMessage={onSendMessage}
        onStopStreaming={onStopStreaming}
        isStreaming={isStreaming}
        selectedSourcesCount={selectedSourcesCount}
        webSearchEnabled={webSearchEnabled}
        onToggleWebSearch={onToggleWebSearch}
      />

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeConfirmDialog();
          }
        }}
      >
        <AlertDialogContent size="default" className="sm:max-w-md">
          <AlertDialogHeader className="text-left place-items-start">
            <AlertDialogTitle>
              {confirmAction === "delete"
                ? "Delete conversation?"
                : "Clear chat messages?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "delete"
                ? "This will permanently remove this conversation and all of its messages. This cannot be undone."
                : "All messages in this chat will be removed. The conversation will stay in your history so you can start fresh."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmAction()}
            >
              {confirmAction === "delete" ? "Delete" : "Clear messages"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
