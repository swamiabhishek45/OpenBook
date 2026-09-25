"use client";

import React, { useState } from "react";
import { Source } from "../lib/types";
import { X, Calendar, Layers, ExternalLink, Download, Loader2 } from "lucide-react";
import { downloadImageFile } from "../lib/download-image";
import { SourceTypeIcon } from "./source-type-icon";
import { SourceStatusBadge } from "./source-status-badge";
import { MarkdownPreview } from "./markdown-preview";
import { formatDate } from "@/lib/utils";
import { dismissOnBackdropClick } from "@/lib/modal";

interface SourcePreviewDialogProps {
  source: Source | null;
  onClose: () => void;
}

export function SourcePreviewDialog({
  source,
  onClose,
}: SourcePreviewDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!source) return null;

  const metadata = source.metadata || {};
  const fileName =
    typeof metadata.fileName === "string" ? metadata.fileName : source.title;
  const chunkCount = typeof metadata.chunkCount === "number" ? metadata.chunkCount : null;
  const fileUrl =
    typeof metadata.fileUrl === "string"
      ? metadata.fileUrl
      : source.url ?? null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onMouseDown={(e) => dismissOnBackdropClick(e, onClose)}
    >
      <div className="w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[85vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2 sm:pr-4">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
              <SourceTypeIcon type={source.type} source={source} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground truncate">
                  {source.title}
                </h2>
                <SourceStatusBadge status={source.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 text-foreground overscroll-contain">
          {source.url && source.type !== "IMAGE" && (
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

          {source.type === "IMAGE" && fileUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Image
                </h3>
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={async () => {
                    setIsDownloading(true);
                    try {
                      await downloadImageFile(fileUrl, fileName);
                    } catch {
                      window.open(fileUrl, "_blank", "noopener,noreferrer");
                    } finally {
                      setIsDownloading(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  Download image
                </button>
              </div>
              <img
                src={fileUrl}
                alt={source.title}
                className="max-h-64 w-full rounded-xl border border-border object-contain bg-muted/30"
              />
            </div>
          )}

          {source.content ? (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {source.type === "IMAGE" ? "OCR & description" : "Extracted Content"}
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
