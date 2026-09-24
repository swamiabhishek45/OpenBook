"use client";

import React, { useState } from "react";
import { ExternalLink, Globe, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CitationItem {
  id: string;
  title: string;
  domain?: string;
  url?: string;
  snippet?: string;
  indexLabel?: string;
  sourceId?: string;
  page?: number;
}

interface CitationsProps {
  sources?: CitationItem[];
  className?: string;
}

export function CitationStack({
  citations,
  className,
}: {
  citations: CitationItem[];
  className?: string;
}) {
  if (!citations.length) return null;

  const shown = citations.slice(0, 3);
  const extra = citations.length - shown.length;

  return (
    <span className={cn("inline-flex items-center -space-x-1", className)}>
      {shown.map((citation) => (
        <span
          key={citation.id}
          title={citation.title}
          className="inline-flex size-4 items-center justify-center rounded-full border border-border bg-background text-[8px] font-semibold text-muted-foreground"
        >
          {(citation.domain || citation.title).charAt(0).toUpperCase()}
        </span>
      ))}
      {extra > 0 ? (
        <span className="pl-1 text-[10px] text-muted-foreground">+{extra}</span>
      ) : null}
    </span>
  );
}

export function CitationList({
  citations,
  idPrefix,
  className,
  highlightedId,
}: {
  citations: CitationItem[];
  idPrefix?: string;
  className?: string;
  highlightedId?: string | null;
}) {
  if (!citations.length) return null;

  return (
    <ul className={cn("space-y-1.5", className)}>
      {citations.map((citation, index) => {
        const itemId = idPrefix ? `${idPrefix}-${citation.id}` : undefined;
        const label = citation.title;
        const meta = citation.domain || citation.snippet;

        const row = (
          <div
            className={cn(
              "rounded-lg border border-border/60 bg-background/80 px-2.5 py-2 text-xs transition-colors",
              highlightedId === citation.id &&
                "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {citation.indexLabel ? (
                <span className="shrink-0 inline-flex min-w-5 justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-primary">
                  {citation.indexLabel}
                </span>
              ) : null}
              <p className="font-medium text-foreground truncate">{label}</p>
            </div>
            {meta ? (
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                {meta}
              </p>
            ) : null}
          </div>
        );

        return (
          <li key={citation.id} id={itemId}>
            {citation.url ? (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              >
                {row}
              </a>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Citations({ sources = [], className }: CitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const displaySources = isExpanded ? sources : sources.slice(0, 3);
  const remainingCount = sources.length - 3;

  return (
    <div className={cn("mt-3 pt-2.5 border-t border-border/60 space-y-2 select-none", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-primary" />
          Sources ({sources.length})
        </span>

        {sources.length > 3 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>+{remainingCount} more</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {displaySources.map((source, index) => {
          const isExternal = Boolean(source.url);

          const content = (
            <div
              className={cn(
                "group/cite flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all max-w-[240px]",
                isExternal
                  ? "bg-secondary/60 hover:bg-secondary border-border text-foreground hover:border-primary/40 cursor-pointer shadow-2xs"
                  : "bg-muted/40 border-border text-muted-foreground"
              )}
            >
              <div className="p-0.5 rounded bg-background/80 border border-border text-foreground shrink-0">
                {isExternal ? (
                  <Globe className="w-2.5 h-2.5" />
                ) : (
                  <FileText className="w-2.5 h-2.5" />
                )}
              </div>

              <span className="text-[11px] font-medium truncate flex-1">
                {source.title}
              </span>

              {source.domain && (
                <span className="text-[9px] text-muted-foreground/80 font-mono truncate hidden sm:inline">
                  {source.domain}
                </span>
              )}

              {isExternal && (
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground group-hover/cite:text-foreground transition-colors shrink-0" />
              )}
            </div>
          );

          if (source.url) {
            return (
              <a
                key={source.id || index}
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
              >
                {content}
              </a>
            );
          }

          return <div key={source.id || index}>{content}</div>;
        })}
      </div>
    </div>
  );
}
