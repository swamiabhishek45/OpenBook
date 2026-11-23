"use client";

import React from "react";
import { Source } from "../lib/types";
import { Trash2, Check, AlertCircle, Eye, RefreshCw } from "lucide-react";
import { CircularLoader } from "@/components/ui/circular-loader";
import { SourceTypeIcon } from "./source-type-icon";
import { RAISED, iconButtonClassName } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

interface SourceItemProps {
  source: Source;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (source: Source) => void;
  onRetry?: (id: string) => void;
  isRetrying?: boolean;
}

export function SourceItem({
  source,
  isSelected,
  onToggleSelect,
  onDelete,
  onPreview,
  onRetry,
  isRetrying = false,
}: SourceItemProps) {
  const getStatusBadge = () => {
    switch (source.status) {
      case "READY":
        return null;
      case "PROCESSING":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <CircularLoader size={11} />
            Indexing
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              <AlertCircle className="size-2.5" />
              Failed
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(source.id);
                }}
                disabled={isRetrying}
                title="Retry processing"
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground transition-colors hover:bg-border/70 disabled:pointer-events-none disabled:opacity-50"
              >
                <RefreshCw className={cn("size-2.5", isRetrying && "animate-spin")} />
                Retry
              </button>
            )}
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-[16px] p-2.5 select-none",
        "transition-[background-color,box-shadow] duration-150 ease-out",
        isSelected
          ? RAISED
          : "bg-card/40 hover:bg-card/80 dark:bg-white/3 dark:hover:bg-white/6",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-2">
        {/* Grounding selection */}
        <button
          type="button"
          onClick={() => onToggleSelect(source.id)}
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Use ${source.title} for grounding`}
          className={cn(
            "flex size-[17px] shrink-0 cursor-pointer items-center justify-center rounded-[6px]",
            "transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            isSelected
              ? "bg-foreground text-background"
              : "bg-muted ring-1 ring-border ring-inset hover:bg-border/70",
          )}
        >
          {isSelected && <Check className="size-3 stroke-3" />}
        </button>

        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-[11px] bg-muted"
        >
          <SourceTypeIcon
            type={source.type}
            source={source}
            className={
              source.type === "YOUTUBE"
                ? "text-red-500 dark:text-red-400"
                : undefined
            }
          />
        </span>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onPreview(source)}
            className="block max-w-full cursor-pointer truncate text-left text-[13px] font-medium text-foreground hover:underline"
          >
            {source.title}
          </button>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              {source.type}
            </span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onPreview(source)}
          title="Preview source content"
          aria-label={`Preview ${source.title}`}
          className={iconButtonClassName({ size: "sm" })}
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Remove "${source.title}" from notebook?`)) {
              onDelete(source.id);
            }
          }}
          title="Delete source"
          aria-label={`Delete ${source.title}`}
          className={iconButtonClassName({ tone: "danger", size: "sm" })}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
