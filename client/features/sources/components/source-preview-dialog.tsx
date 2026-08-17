"use client";

import React from "react";
import { Source } from "../lib/types";
import { X, Calendar, Layers, ExternalLink } from "lucide-react";
import { SourceTypeIcon } from "./source-type-icon";
import { SourceStatusBadge } from "./source-status-badge";
import { MarkdownPreview } from "./markdown-preview";
import { formatDate } from "@/lib/utils";

interface SourcePreviewDialogProps {
  source: Source | null;
  onClose: () => void;
}

export function SourcePreviewDialog({
  source,
  onClose,
}: SourcePreviewDialogProps) {
  if (!source) return null;

  const metadata = source.metadata || {};
  const chunkCount = typeof metadata.chunkCount === "number" ? metadata.chunkCount : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
              <SourceTypeIcon type={source.type} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground truncate">
                  {source.title}
                </h2>
                <SourceStatusBadge status={source.status} />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                <span>{source.type}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(source.createdAt)}
                </span>
                {chunkCount !== null && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {chunkCount} chunks indexed
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-foreground">
          {source.url && (
            <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">URL: </span>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline hover:no-underline break-all"
              >
                {source.url}
              </a>
            </div>
          )}

          {source.content ? (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extracted Content
              </h3>
              <MarkdownPreview content={source.content} />
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              No content preview available for this source.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
