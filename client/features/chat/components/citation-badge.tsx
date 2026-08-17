"use client";

import React, { useState } from "react";
import { Citation } from "../types";
import { FileText, Globe, ExternalLink } from "lucide-react";

interface CitationBadgeProps {
  citation: Citation;
  index: number;
}

export function CitationBadge({ citation, index }: CitationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block align-baseline mx-0.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-mono font-medium border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
        title={citation.sourceTitle || "Source Citation"}
      >
        {index + 1}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-card border border-border text-foreground rounded-xl shadow-2xl z-50 text-left space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                {citation.url ? (
                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="text-xs font-semibold text-foreground truncate">
                  {citation.sourceTitle || "Source Reference"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                #{index + 1}
              </span>
            </div>

            {citation.excerpt && (
              <p className="text-xs text-muted-foreground leading-relaxed max-h-32 overflow-y-auto italic">
                &ldquo;{citation.excerpt}&rdquo;
              </p>
            )}

            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline pt-1"
              >
                <span>Open original link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </>
      )}
    </span>
  );
}

