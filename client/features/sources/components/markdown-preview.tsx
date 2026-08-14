"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        No preview content available
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-card/50 p-4 text-xs sm:text-sm text-foreground font-mono leading-relaxed whitespace-pre-wrap selection:bg-muted select-text",
        className
      )}
    >
      {content}
    </div>
  );
}
