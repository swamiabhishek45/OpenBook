"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Globe, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUsage, useUpgradeModal } from "@/features/billing";


interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopStreaming?: () => void;
  isStreaming: boolean;
  selectedSourcesCount: number;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
}

export function ChatInput({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  selectedSourcesCount,
  webSearchEnabled,
  onToggleWebSearch,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { usage, isPro } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  const isLimitReached = !isPro && Boolean(usage?.messages.exceeded);
  const messageCount = usage?.messages.count ?? 0;
  const messageLimit = usage?.messages.limit ?? 10;

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;

    if (isLimitReached) {
      openUpgradeModal({
        reason: "Free limit reached: You can send up to 10 chat messages on the Free plan. Upgrade to Pro for unlimited chats.",
        limitType: "messages",
      });
      return;
    }

    onSendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/40 space-y-2">
      {/* Free limit reached banner */}
      {isLimitReached && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/80 border border-border text-foreground text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <span>
              Free chat limit reached ({messageCount}/{messageLimit} messages used).
            </span>
          </div>
          <Button
            type="button"
            size="xs"
            variant="default"
            onClick={() =>
              openUpgradeModal({
                reason: "Free limit reached: Max 10 messages allowed. Upgrade to Pro for unlimited chat.",
                limitType: "messages",
              })
            }
            className="font-semibold text-xs gap-1 shadow-xs"
          >
            Upgrade to Pro
          </Button>
        </div>
      )}


      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-border bg-card shadow-lg focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-ring transition-all p-3 space-y-2.5"
      >
        {/* Text input area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLimitReached
              ? "Upgrade to Pro to send more messages..."
              : selectedSourcesCount > 0
              ? `Ask a question about your selected sources...`
              : "Ask anything, or add sources to ground your chat..."
          }
          rows={1}
          disabled={isStreaming || isLimitReached}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-44 leading-relaxed font-sans disabled:opacity-60 disabled:cursor-not-allowed"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Source grounding status pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/70 border border-border text-[11px] text-muted-foreground">
              <FileText className="w-3 h-3 text-foreground" />
              <span>
                {selectedSourcesCount > 0
                  ? `${selectedSourcesCount} sources`
                  : "No sources"}
              </span>
            </div>

            {/* Web search toggle */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              title="Toggle Tavily live web search"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
                webSearchEnabled
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/70 border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="w-3 h-3" />
              <span>Web search</span>
            </button>

            {/* Free tier message counter indicator */}
            {!isPro && (
              <button
                type="button"
                onClick={() =>
                  openUpgradeModal({
                    reason: "Upgrade to Pro for unlimited chat messages.",
                    limitType: "messages",
                  })
                }
                title="Your Free tier message usage"
                className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border transition-colors cursor-pointer ${
                  isLimitReached
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <span>
                  {messageCount}/{messageLimit} chats
                </span>
              </button>
            )}
          </div>

          {/* Submit / Stop button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              title="Stop generating"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-[2px] bg-background" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLimitReached}
              title={isLimitReached ? "Upgrade to Pro to send messages" : "Send message"}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary hover:opacity-90 active:scale-95 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

