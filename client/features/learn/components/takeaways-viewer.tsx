"use client";

import React, { useState } from "react";
import { CheckSquare, Square, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface TakeawaysViewerProps {
  content: string | string[] | Record<string, unknown>;
}

function renderFormattedTakeaway(text: string) {
  if (!text.includes("**")) {
    return <span>{text}</span>;
  }

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          return (
            <strong key={i} className="font-semibold text-foreground">
              {inner}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export function TakeawaysViewer({ content }: TakeawaysViewerProps) {
  const items: string[] = Array.isArray(content)
    ? content
    : typeof content === "string"
    ? content.split("\n").map((s) => s.replace(/^[-*•\d.]+\s*/, "").trim()).filter(Boolean)
    : ["Synthesize key materials", "Review core arguments", "Test retention with quizzes"];

  const [checkedIndices, setCheckedIndices] = useState<number[]>([]);

  const toggleCheck = (idx: number) => {
    setCheckedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-foreground">Actionable Takeaways</span>
        </div>
        <span>
          {checkedIndices.length}/{items.length} completed
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const isChecked = checkedIndices.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={cn(
                "p-3 rounded-xl border border-border transition-all flex items-start gap-3 cursor-pointer select-none",
                isChecked ? "bg-muted/30 text-muted-foreground line-through" : "bg-card text-foreground hover:bg-muted/20"
              )}
            >
              <button type="button" className="mt-0.5 text-muted-foreground hover:text-foreground">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <p className="text-xs leading-relaxed flex-1">
                {renderFormattedTakeaway(item)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

