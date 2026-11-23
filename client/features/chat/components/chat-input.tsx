"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Globe, Zap, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PillButton, iconButtonClassName } from "@/components/ui/pill";
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
    <div className="space-y-2 px-3 pt-1 pb-3 sm:px-4">
      {isOutOfCredits && (
        <div className="animate-fadeIn flex items-center justify-between gap-3 rounded-full bg-amber-500/12 py-1.5 pr-1.5 pl-4 text-[13px] font-medium text-foreground">
          <span className="flex min-w-0 items-center gap-2">
            <Zap className="size-4 shrink-0 text-amber-500" />
            <span className="truncate">
              No credits left. Each chat costs 1 credit.
            </span>
          </span>
          <PillButton
            size="xs"
            onClick={() =>
              openUpgradeModal({
                reason: "You need credits to send chat messages. Top up your balance to continue.",
                limitType: "credits",
                requiredCredits: 1,
                currentCredits: credits,
              })
            }
          >
            Top up
          </PillButton>
        </div>
      )}


      <div
        className={cn(
          "rounded-[26px] p-[1.5px] transition-all duration-300",
          isEnhancing
            ? "bg-[linear-gradient(135deg,#22d3ee_0%,#8b5cf6_45%,#ec4899_100%)] shadow-[0_0_24px_rgba(139,92,246,0.25)]"
            : "bg-border/70 focus-within:bg-foreground/20",
        )}
      >
        <form
          onSubmit={handleSubmit}
          className="relative space-y-2.5 rounded-[24.5px] bg-card p-3 shadow-[0_12px_28px_-16px_rgb(0_0_0/0.25)]"
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
          className="max-h-44 w-full resize-none bg-transparent px-1.5 pt-1 font-sans text-[14.5px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Web search toggle */}
            <PillButton
              size="xs"
              variant={webSearchEnabled ? "ink" : "chip"}
              onClick={onToggleWebSearch}
              aria-pressed={webSearchEnabled}
              title="Toggle live web search"
              className={cn(!webSearchEnabled && "text-muted-foreground")}
            >
              <Globe className="size-3.5" />
              <span>Web search</span>
            </PillButton>
          </div>

          <div className="flex items-center gap-1.5">
            {isEnhancing && (
              <span
                className="flex size-9 items-center justify-center rounded-full bg-muted"
                aria-label="Enhancing prompt"
                aria-busy="true"
              >
                <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
              </span>
            )}

            {showEnhanceControl && !isEnhancing && (
              <PillButton
                size="xs"
                variant={isEnhanced ? "chip" : "ghost"}
                onClick={() => void handleEnhanceOrRevert()}
                title={
                  isEnhanced
                    ? "Restore your original prompt"
                    : "Improve clarity with Gemini"
                }
              >
                {isEnhanced ? "Revert" : "Enhance prompt"}
              </PillButton>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                title="Stop generating"
                aria-label="Stop generating"
                className={cn(
                  iconButtonClassName(),
                  "bg-foreground text-background hover:bg-foreground/88",
                )}
              >
                <span className="size-2.5 rounded-[3px] bg-background" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isOutOfCredits}
                title={
                  isOutOfCredits
                    ? "Top up credits to send messages"
                    : "Send message (1 credit)"
                }
                aria-label="Send message"
                className={cn(
                  iconButtonClassName(),
                  "bg-foreground text-background hover:bg-foreground/88 disabled:opacity-35",
                )}
              >
                <ArrowUp className="size-4 stroke-[2.5]" />
              </button>
            )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

