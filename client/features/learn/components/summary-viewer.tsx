"use client";

import React from "react";
import { StreamdownContent } from "@/shared/components/streamdown-content";
import { BookOpen } from "lucide-react";

interface SummaryViewerProps {
  content: string;
  title?: string;
}

export function SummaryViewer({ content, title }: SummaryViewerProps) {
  return (
    <div className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 pb-3 border-b border-border text-xs text-muted-foreground">
        <BookOpen className="w-4 h-4 text-foreground" />
        <span className="font-semibold text-foreground">{title || "Study Guide & Executive Summary"}</span>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <StreamdownContent content={content} />
      </div>
    </div>
  );
}
