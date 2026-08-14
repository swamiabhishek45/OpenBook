"use client";

import React from "react";
import { Source } from "../types";
import {
  FileText,
  Globe,
  Video,
  FileCode,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceItemProps {
  source: Source;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (source: Source) => void;
}

export function SourceItem({
  source,
  isSelected,
  onToggleSelect,
  onDelete,
  onPreview,
}: SourceItemProps) {
  const getIcon = () => {
    switch (source.type) {
      case "PDF":
        return <FileText className="w-4 h-4 text-foreground" />;
      case "WEBSITE":
        return <Globe className="w-4 h-4 text-foreground" />;
      case "YOUTUBE":
        return <Video className="w-4 h-4 text-foreground" />;
      default:
        return <FileCode className="w-4 h-4 text-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (source.status) {
      case "READY":
        return null;
      case "PROCESSING":
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            Indexing
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/30">
            <AlertCircle className="w-2.5 h-2.5" />
            Failed
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 select-none",
        isSelected
          ? "border-primary bg-muted/80 shadow-xs"
          : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-card hover:bg-muted/40"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        {/* Grounding Selection Checkbox */}
        <button
          type="button"
          onClick={() => onToggleSelect(source.id)}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border bg-card hover:border-muted-foreground"
          )}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Source Icon */}
        <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
          {getIcon()}
        </div>

        {/* Title & Status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              onClick={() => onPreview(source)}
              className="text-xs font-medium text-foreground hover:underline truncate cursor-pointer"
            >
              {source.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              {source.type}
            </span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onPreview(source)}
          title="Preview source content"
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Remove "${source.title}" from notebook?`)) {
              onDelete(source.id);
            }
          }}
          title="Delete source"
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
