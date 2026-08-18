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
}

interface CitationsProps {
  sources?: CitationItem[];
  className?: string;
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
