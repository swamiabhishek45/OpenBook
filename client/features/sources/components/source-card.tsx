"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { SOURCE_TYPE_LABELS } from "../lib/constants";
import type { Source } from "../lib/types";
import { SourceStatusBadge } from "./source-status-badge";
import { SourceTypeIcon } from "./source-type-icon";
import { cn } from "@/lib/utils";

interface SourceCardProps {
  source: Source;
  onSelect?: (source: Source) => void;
  onDelete?: (source: Source) => void;
  onReprocess?: (source: Source) => void;
  className?: string;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function SourceCard({
  source,
  onSelect,
  onDelete,
  onReprocess,
  className,
  selected,
  onToggleSelect,
}: SourceCardProps) {
  return (
    <div
      onClick={() => onSelect?.(source)}
      className={cn(
        "group relative flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer shadow-xs",
        selected && "ring-1 ring-primary border-primary/50",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect(source.id);
                }}
                className="rounded border-border text-primary focus:ring-0 cursor-pointer shrink-0"
              />
            )}
            <div className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
              <SourceTypeIcon type={source.type} />
            </div>
            <h4 className="text-xs font-semibold text-foreground truncate group-hover:underline">
              {source.title}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {onReprocess && source.status === "FAILED" && (
              <button
                type="button"
                onClick={() => onReprocess(source)}
                title="Reprocess source"
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(source)}
                title="Delete source"
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {source.content && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {source.content}
          </p>
        )}
      </div>

      <div className="pt-3 mt-2 border-t border-border flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <span>{SOURCE_TYPE_LABELS[source.type]}</span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(source.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open original link"
              className="hover:text-foreground"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <SourceStatusBadge status={source.status} />
        </div>
      </div>
    </div>
  );
}
