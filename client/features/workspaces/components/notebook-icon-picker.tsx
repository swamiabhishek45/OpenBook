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
  label = "Notebook icon",
  className,
}: NotebookIconPickerProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[13px] font-medium text-foreground">{label}</p>

      <div
        role="radiogroup"
        aria-label={label}
        className="flex max-h-28 flex-wrap gap-1 overflow-y-auto rounded-[16px] bg-muted/60 p-2 dark:bg-muted/40"
      >
        {NOTEBOOK_ICONS.map((icon) => {
          const isSelected = value === icon;
          return (
            <button
              key={icon}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Icon ${icon}`}
              onClick={() => onChange(icon)}
              className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-full text-[17px]",
                "transition-[background-color,transform] duration-150 ease-out active:scale-95",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                isSelected
                  ? "bg-card shadow-[0_1px_3px_rgb(0_0_0/0.12)] ring-1 ring-foreground/15"
                  : "hover:bg-foreground/6",
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
