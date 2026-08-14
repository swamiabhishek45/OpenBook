"use client";

import React from "react";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { useSources } from "../hooks/use-sources";
import { sourceRoutes } from "../lib/routes";
import { SourceTypeIcon } from "./source-type-icon";
import { SourceStatusBadge } from "./source-status-badge";
import { cn } from "@/lib/utils";

interface SourceSidebarListProps {
  workspaceId: string;
  onAddSource: () => void;
  className?: string;
}

export function SourceSidebarList({
  workspaceId,
  onAddSource,
  className,
}: SourceSidebarListProps) {
  const { data: sources, isLoading } = useSources(workspaceId);

  return (
    <div className={cn("space-y-2 p-3", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sources ({sources?.length || 0})
        </span>
        <button
          type="button"
          onClick={onAddSource}
          title="Add source"
          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : sources && sources.length > 0 ? (
        <div className="space-y-1">
          {sources.slice(0, 8).map((source) => (
            <Link
              key={source.id}
              href={sourceRoutes.detail(workspaceId, source.id)}
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 text-xs text-foreground transition-all group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <SourceTypeIcon type={source.type} className="text-muted-foreground group-hover:text-foreground" />
                <span className="truncate">{source.title}</span>
              </div>
              <SourceStatusBadge status={source.status} showIcon={false} className="text-[9px] px-1 py-0" />
            </Link>
          ))}

          {sources.length > 8 && (
            <Link
              href={sourceRoutes.list(workspaceId)}
              className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>View all ({sources.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="p-3 text-center border border-dashed border-border rounded-xl space-y-1.5">
          <p className="text-[11px] text-muted-foreground">No sources yet.</p>
          <button
            type="button"
            onClick={onAddSource}
            className="w-full py-1 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            + Add source
          </button>
        </div>
      )}
    </div>
  );
}
