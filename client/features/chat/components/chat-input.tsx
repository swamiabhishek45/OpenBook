"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Globe, Zap, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUsage, useUpgradeModal } from "@/features/billing";
import { enhanceChatPrompt } from "../lib/api";
import { toast } from "@/components/ui/toast";


interface ChatInputProps {
  workspaceId: string;
  defaultModel?: string;
  onModelChange?: (model: string) => void;
  onSendMessage: (message: string) => void;
  onStopStreaming?: () => void;
  isStreaming: boolean;
  selectedSourcesCount: number;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
}

export function ChatInput({
  workspaceId,
  defaultModel,
  onModelChange,
  onSendMessage,
  onStopStreaming,
  isStreaming,
  selectedSourcesCount,
  webSearchEnabled,
  onToggleWebSearch,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [promptBeforeEnhance, setPromptBeforeEnhance] = useState<string | null>(
    null,
  );
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { credits } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  const isOutOfCredits = credits < 1;

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

    if (isOutOfCredits) {
      openUpgradeModal({
        reason: "You need at least 1 credit to send a chat message. Please top up your balance.",
        limitType: "credits",
        requiredCredits: 1,
        currentCredits: credits,
      });
      return;
    }

    onSendMessage(input);
    setInput("");
    setPromptBeforeEnhance(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleEnhanceOrRevert = async () => {
    if (isEnhancing || isStreaming) return;

    if (promptBeforeEnhance !== null) {
      setInput(promptBeforeEnhance);
      setPromptBeforeEnhance(null);
      return;
    }

    const current = input.trim();
    if (!current) return;

    setIsEnhancing(true);
    try {
      const { enhanced } = await enhanceChatPrompt(
        workspaceId,
        current,
        selectedSourcesCount,
      );
      setPromptBeforeEnhance(current);
      setInput(enhanced);
    } catch (err) {
      toast.add({
        title: "Could not enhance prompt",
        description:
          err instanceof Error ? err.message : "Please try again.",
        type: "error",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const showEnhanceControl =
  input.trim().length > 0 && !isStreaming && !isOutOfCredits;
  const isEnhanced = promptBeforeEnhance !== null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/40 space-y-2">
      {/* Insufficient credits banner */}
      {isOutOfCredits && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-foreground text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              You have 0 credits remaining. Chats cost 1 credit each.
            </span>
          </div>
          <Button
            type="button"
            size="xs"
            variant="default"
            onClick={() =>
              openUpgradeModal({
                reason: "You need credits to send chat messages. Top up your balance to continue.",
                limitType: "credits",
                requiredCredits: 1,
                currentCredits: credits,
              })
            }
            className="font-semibold text-xs gap-1 shadow-xs cursor-pointer"
          >
            Top Up Credits
          </Button>
        </div>
      )}


      <div
        className={cn(
          "rounded-2xl p-[1.5px] transition-all duration-300",
          isEnhancing
            ? "bg-[linear-gradient(135deg,#22d3ee_0%,#8b5cf6_45%,#ec4899_100%)] shadow-[0_0_24px_rgba(139,92,246,0.25)]"
            : "bg-border focus-within:bg-zinc-400 dark:focus-within:bg-zinc-600 has-[:focus]:bg-zinc-400 dark:has-[:focus]:bg-zinc-600",
        )}
      >
      <form
        onSubmit={handleSubmit}
        className="relative rounded-[calc(1rem-1px)] bg-card shadow-lg p-3 space-y-2.5"
      >
        {/* Text input area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (promptBeforeEnhance !== null) {
              setPromptBeforeEnhance(null);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isOutOfCredits
              ? "Top up your credits to send messages..."
              : selectedSourcesCount > 0
              ? `Ask a question about your selected sources...`
              : "Ask anything, or add sources to ground your chat..."
          }
          rows={1}
          disabled={isStreaming || isOutOfCredits}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-44 leading-relaxed font-sans disabled:opacity-60 disabled:cursor-not-allowed"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Web search toggle */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              title="Toggle Tavily live web search"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer",
                webSearchEnabled
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/70 border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="w-3 h-3" />
              <span>Web search</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isEnhancing && (
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/80 border border-border"
                aria-label="Enhancing prompt"
                aria-busy="true"
              >
                <LoaderCircle className="w-4 h-4 text-muted-foreground animate-spin" />
              </div>
            )}

            {showEnhanceControl && !isEnhancing && (
              <button
                type="button"
                onClick={() => void handleEnhanceOrRevert()}
                title={
                  isEnhanced
                    ? "Restore your original prompt"
                    : "Improve clarity with Gemini"
                }
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium border border-[#2a2a2a] dark:border-[#333333] transition-colors",
                  isEnhanced
                    ? "bg-muted/50 text-foreground hover:bg-muted/80"
                    : "bg-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {isEnhanced ? "Revert" : "Enhance prompt"}
              </button>
            )}

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
              disabled={!input.trim() || isOutOfCredits}
              title={isOutOfCredits ? "Top up credits to send messages" : "Send message (1 credit)"}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-primary hover:opacity-90 active:scale-95 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}

