"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, ExternalLink, RefreshCw, Layers, Calendar, FileText, Loader2 } from "lucide-react";
import { useSource, useReprocessSource } from "../hooks/use-sources";
import { SOURCE_TYPE_LABELS } from "../lib/constants";
import { sourceRoutes } from "../lib/routes";
import { MarkdownPreview } from "./markdown-preview";
import { SourceStatusBadge } from "./source-status-badge";
import { SourceTypeIcon } from "./source-type-icon";
import { cn } from "@/lib/utils";

interface SourceDetailProps {
  workspaceId: string;
  sourceId: string;
}

export function SourceDetail({ workspaceId, sourceId }: SourceDetailProps) {
  const { data: source, isLoading, error } = useSource(workspaceId, sourceId);
  const reprocessMutation = useReprocessSource(workspaceId);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-muted-foreground gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xs">Loading source details...</span>
      </div>
    );
  }

  if (error || !source) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
        <p className="text-sm font-medium text-destructive">Could not load source</p>
        <Link
          href={sourceRoutes.list(workspaceId)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to library
        </Link>
      </div>
    );
  }

  const metadata = source.metadata || {};
  const fileUrl = typeof metadata.fileUrl === "string" ? metadata.fileUrl : null;
  const fileName = typeof metadata.fileName === "string" ? metadata.fileName : null;
  const chunkCount = typeof metadata.chunkCount === "number" ? metadata.chunkCount : null;
  const processingError = typeof metadata.processingError === "string" ? metadata.processingError : null;
  const isProcessing = source.status === "PENDING" || source.status === "PROCESSING";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href={sourceRoutes.list(workspaceId)}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center">
                <SourceTypeIcon type={source.type} />
              </div>
              <h2 className="text-lg font-semibold text-foreground truncate">
                {source.title}
              </h2>
              <SourceStatusBadge status={source.status} />
            </div>

            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span>{SOURCE_TYPE_LABELS[source.type]}</span>
              <span>·</span>
              <span>
                Added {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}
              </span>
              {chunkCount !== null && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {chunkCount} chunks indexed
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {source.status === "FAILED" && (
          <button
            type="button"
            onClick={() => reprocessMutation.mutate(source.id)}
            disabled={reprocessMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", reprocessMutation.isPending && "animate-spin")} />
            Reprocess
          </button>
        )}
      </div>

      {/* External URL if present */}
      {source.url && (
        <div className="flex items-center gap-2 text-xs p-3 rounded-lg border border-border bg-card text-muted-foreground">
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">URL:</span>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline hover:no-underline truncate"
          >
            {source.url}
          </a>
        </div>
      )}

      {/* PDF file info */}
      {source.type === "PDF" && fileUrl && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-foreground" />
            <div>
              <p className="font-medium text-foreground">{fileName || "Uploaded PDF"}</p>
              <p className="text-muted-foreground text-[11px]">Ready for grounded querying</p>
            </div>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
          >
            Open PDF
          </a>
        </div>
      )}

      {/* Main Content / Status State */}
      {isProcessing ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          <p className="text-xs font-medium text-foreground">Processing Source</p>
          <p className="text-[11px] text-muted-foreground">
            Extracting text, chunking passages, and embedding vector index.
          </p>
        </div>
      ) : source.status === "FAILED" ? (
        <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2 text-xs text-destructive">
          <p className="font-semibold">Processing failed</p>
          <p className="text-muted-foreground">{processingError || "An error occurred during extraction or embedding."}</p>
        </div>
      ) : source.content ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Extracted Content
          </h3>
          <MarkdownPreview content={source.content} />
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
          No extracted content available for this source.
        </div>
      )}
    </div>
  );
}
