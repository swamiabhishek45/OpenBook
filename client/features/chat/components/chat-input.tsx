"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Globe, FileText, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="p-4 border-t border-border bg-card/40">
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
            selectedSourcesCount > 0
              ? `Ask a question about your selected sources...`
              : "Ask anything, or add sources to ground your chat..."
          }
          rows={1}
          disabled={isStreaming}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-44 leading-relaxed font-sans"
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
              disabled={!input.trim()}
              title="Send message"
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary hover:opacity-90 active:scale-95 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
