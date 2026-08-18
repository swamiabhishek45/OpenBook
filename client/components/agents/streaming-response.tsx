"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCcw, Sparkles } from "lucide-react";
import { Citations, CitationItem } from "./citations";
import { ReasoningText } from "./loading-states/reasoning-text";
import { cn } from "@/lib/utils";


export interface StreamingResponseProps {
  children: React.ReactNode;
  status?: "streaming" | "complete" | "idle";
  copyText?: string;
  onRetry?: () => void;
  sources?: CitationItem[];
  className?: string;
}

export function StreamingResponse({
  children,
  status = "complete",
  copyText,
  onRetry,
  sources = [],
  className,
}: StreamingResponseProps) {
  const [copied, setCopied] = useState(false);
  const isStreaming = status === "streaming";

  const handleCopy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      aria-busy={isStreaming}
      className={cn(
        "group/stream relative w-full space-y-3 font-sans text-sm text-foreground leading-relaxed select-text",
        className
      )}
    >
      {/* Streaming Content Body */}
      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed break-words">
        {children}

        {/* Pulsing blinking cursor while streaming */}
        {isStreaming && (
          <span
            className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle rounded-xs animate-pulse duration-300"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Sources Citations Section */}
      {sources.length > 0 && <Citations sources={sources} />}

      {/* Interactive Action Toolbar (Copy, Retry, Status) */}
      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-2">

          {isStreaming && (
            <ReasoningText
              variant="cascade"
              phrases={[
                "Thinking",
                "Reading the request",
                "Working through the details",
                "Preparing the answer",
              ]}
              className="text-[11px]"
            />
          )}
        </div>


        <div className="flex items-center gap-1 opacity-80 group-hover/stream:opacity-100 transition-opacity">
          {copyText && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy answer markdown"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Copy</span>
                </>
              )}
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              title="Retry / Regenerate response"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
