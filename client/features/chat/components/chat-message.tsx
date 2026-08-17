"use client";

import React, { useState } from "react";
import { ChatMessage as ChatMessageType } from "../types";
import { CitationBadge } from "./citation-badge";
import { Sparkles, User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
  isStreaming?: boolean;
}

export function ChatMessage({
  message,
  isLast,
  isStreaming,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format content with basic line break & citation helpers
  const renderFormattedContent = (content: string) => {
    if (!content) {
      if (!isUser && isLast && isStreaming) {
        return (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground italic text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
            Thinking and searching sources...
          </span>
        );
      }
      return null;
    }

    return (
      <div className="space-y-3 leading-relaxed whitespace-pre-wrap font-sans text-sm text-foreground">
        {content}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3.5 p-4 rounded-2xl transition-all shadow-xs",
        isUser
          ? "bg-zinc-100/90 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 text-foreground max-w-[85%] ml-auto"
          : "bg-card dark:bg-zinc-900/40 border border-border text-foreground max-w-[95%] mr-auto"
      )}
    >
      {/* Role Avatar Icon */}
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 shadow-xs",
          isUser
            ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-800 dark:border-zinc-200 text-white dark:text-zinc-900"
            : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground/80">
            {isUser ? "You" : "OpenBook"}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy message"
            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground rounded transition-all cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div>{renderFormattedContent(message.content)}</div>

        {/* Citations List if available on message */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Sources Cited ({message.citations.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((citation, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <CitationBadge citation={citation} index={idx} />
                  <span className="text-[11px] text-muted-foreground max-w-[160px] truncate">
                    {citation.sourceTitle || citation.url || "Source"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

