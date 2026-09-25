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
  layout?: "grid" | "list";
}

export function SourceCard({
  source,
  onSelect,
  onDelete,
  onReprocess,
  className,
  selected,
  onToggleSelect,
  layout = "grid",
}: SourceCardProps) {
  const isList = layout === "list";

  return (
    <div
      onClick={() => onSelect?.(source)}
      className={cn(
        "group relative flex rounded-xl border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer shadow-xs min-w-0",
        isList
          ? "flex-row items-center gap-2.5 p-3 sm:p-3.5"
          : "flex-col justify-between p-3.5 sm:p-4",
        selected && "bg-muted/40 border-border",
        className
      )}
    >
      {onToggleSelect && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center shrink-0"
        >
          <input
            type="checkbox"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(source.id);
            }}
            className="w-4 h-4 rounded border-border text-primary focus:ring-0 cursor-pointer shrink-0"
          />
        </div>
      )}

      <div
        className={cn(
          "min-w-0 flex-1",
          isList ? "flex items-center gap-2.5" : "space-y-2",
        )}
      >
        <div
          className={cn(
            "flex min-w-0",
            isList
              ? "items-center gap-2.5 flex-1"
              : "items-start justify-between gap-2 flex-col sm:flex-row sm:items-start",
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
              <SourceTypeIcon type={source.type} source={source} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-foreground truncate group-hover:underline">
                {source.title}
              </h4>
              {isList && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {SOURCE_TYPE_LABELS[source.type]}
                  <span className="mx-1">·</span>
                  {formatDistanceToNow(new Date(source.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          </div>

          {!isList && (
            <div
              className="flex items-center gap-1 shrink-0 self-end sm:self-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {onReprocess && source.status === "FAILED" && (
                <button
                  type="button"
                  onClick={() => onReprocess(source)}
                  title="Retry processing"
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(source)}
                  title="Delete source"
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {!isList && source.content && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {source.content}
          </p>
        )}

        {!isList && (
          <div className="pt-3 mt-1 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="shrink-0">{SOURCE_TYPE_LABELS[source.type]}</span>
              <span>·</span>
              <span className="truncate">
                {formatDistanceToNow(new Date(source.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {source.url && source.type !== "IMAGE" && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open original link"
                  className="hover:text-foreground p-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <SourceStatusBadge status={source.status} />
            </div>
          </div>
        )}
      </div>

      {isList && (
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <SourceStatusBadge status={source.status} />
          {onReprocess && source.status === "FAILED" && (
            <button
              type="button"
              onClick={() => onReprocess(source)}
              title="Retry processing"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(source)}
              title="Delete source"
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
