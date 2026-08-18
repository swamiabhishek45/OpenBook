"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const NOTEBOOK_ICONS = [
  "📚",
  "🔬",
  "💻",
  "🧠",
  "📊",
  "⚡",
  "🎨",
  "📝",
  "🌐",
  "🎯",
  "🚀",
  "💡",
  "📌",
  "✨",
  "🔥",
  "🤖",
  "📖",
  "🎓",
  "🧪",
  "🛠️",
] as const;

export interface NotebookIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
  className?: string;
}

export function NotebookIconPicker({
  value,
  onChange,
  label = "Workspace Icon",
  className,
}: NotebookIconPickerProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-foreground flex items-center justify-between">
        <span>{label}</span>
        <span className="text-muted-foreground text-[11px]">Selected: {value}</span>
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-muted/30 max-h-28 overflow-y-auto">
        {NOTEBOOK_ICONS.map((icon) => {
          const isSelected = value === icon;
          return (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              className={cn(
                "w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer",
                isSelected
                  ? "bg-primary text-primary-foreground border-2 border-primary scale-105 shadow-xs"
                  : "hover:bg-muted border border-transparent"
              )}
            >
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
