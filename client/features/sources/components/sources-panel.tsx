"use client";

import React, { useState } from "react";
import { Source } from "../lib/types";
import { SourceItem } from "./source-item";
import { AddSourceDialog } from "./add-source-dialog";
import { SourcePreviewDialog } from "./source-preview-dialog";
import { Plus, Search, CheckSquare, Square, FileBox, X } from "lucide-react";
import { useReprocessSource } from "../hooks/use-sources";
import {
  PanelLabel,
  PillButton,
  RAISED,
  SOFT_INPUT,
  iconButtonClassName,
} from "@/components/ui/pill";
import { cn } from "@/lib/utils";

interface SourcesPanelProps {
  workspaceId?: string;
  sources: Source[];
  selectedSourceIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUploadPdf: (file: File, title?: string) => Promise<unknown>;
  onImportWebsite: (url: string, title?: string) => Promise<unknown>;
  onImportYoutube: (url: string, title?: string) => Promise<unknown>;
  onCreateTextSource: (title: string, content: string) => Promise<unknown>;
  onDeleteSource: (id: string) => Promise<unknown>;
  isLoading?: boolean;
}

export function SourcesPanel({
  workspaceId,
  sources,
  selectedSourceIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onUploadPdf,
  onImportWebsite,
  onImportYoutube,
  onCreateTextSource,
  onDeleteSource,
  isLoading,
}: SourcesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const reprocessMutation = useReprocessSource(workspaceId ?? "");

  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected =
    sources.length > 0 && selectedSourceIds.length === sources.length;

  return (
    <div className="flex h-full flex-col px-2 pb-3 text-foreground select-none">
      {/* The panel body is one soft surface, like a landing-page bento tile. */}
      <div className="flex h-full min-h-0 flex-col rounded-[22px] bg-muted/60 dark:bg-muted/70">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
          <PanelLabel count={sources.length}>Sources</PanelLabel>

          <PillButton size="xs" onClick={() => setIsAddOpen(true)}>
            <Plus className="size-3.5" strokeWidth={2.4} />
            <span>Add</span>
          </PillButton>
        </div>

        <div className="space-y-2.5 px-4 pb-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources"
              aria-label="Search sources"
              className={cn(
                SOFT_INPUT,
                RAISED,
                "h-9 pl-9 text-[13px] focus:bg-card dark:focus:bg-white/8",
                searchQuery ? "pr-9" : "pr-3.5",
                "[&::-webkit-search-cancel-button]:hidden",
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className={cn(
                  iconButtonClassName({ size: "sm" }),
                  "absolute top-1/2 right-1 -translate-y-1/2",
                )}
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {sources.length > 0 && (
            <div className="flex items-center justify-between px-1 text-[12px] text-muted-foreground">
              <button
                type="button"
                onClick={allSelected ? onDeselectAll : onSelectAll}
                className="flex cursor-pointer items-center gap-1.5 rounded-full transition-colors hover:text-foreground"
              >
                {allSelected ? (
                  <CheckSquare className="size-3.5 text-foreground" />
                ) : (
                  <Square className="size-3.5" />
                )}
                <span>{allSelected ? "Deselect all" : "Select all"}</span>
              </button>

              <span className="font-mono">
                {selectedSourceIds.length}/{sources.length} active
              </span>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
          {isLoading ? (
            <div className="space-y-1.5" aria-busy="true">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-[16px] bg-card/60 dark:bg-white/4" />
              ))}
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3.5 p-6 text-center">
              <span
                aria-hidden="true"
                className={cn(RAISED, "flex size-12 items-center justify-center rounded-[16px] text-muted-foreground")}
              >
                <FileBox className="size-5" />
              </span>

              <div>
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                  {searchQuery ? "Nothing matches" : "No sources yet"}
                </p>
                <p className="mx-auto mt-1 max-w-[220px] text-[13px] leading-[1.5] text-muted-foreground">
                  {searchQuery
                    ? "Try a different title, or clear the search."
                    : "Add PDFs, web pages, or YouTube links to ground this notebook."}
                </p>
              </div>

              {!searchQuery && (
                <PillButton variant="card" size="sm" onClick={() => setIsAddOpen(true)}>
                  <Plus className="size-3.5" strokeWidth={2.4} />
                  <span>Add first source</span>
                </PillButton>
              )}
            </div>
          ) : (
            filteredSources.map((source) => (
              <SourceItem
                key={source.id}
                source={source}
                isSelected={selectedSourceIds.includes(source.id)}
                onToggleSelect={onToggleSelect}
                onDelete={onDeleteSource}
                onPreview={(s) => setPreviewSource(s)}
                onRetry={
                  workspaceId ? (id) => reprocessMutation.mutate(id) : undefined
                }
                isRetrying={
                  reprocessMutation.isPending &&
                  reprocessMutation.variables === source.id
                }
              />
            ))
          )}
        </div>
      </div>

      <AddSourceDialog
        workspaceId={workspaceId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onUploadPdf={onUploadPdf}
        onImportWebsite={onImportWebsite}
        onImportYoutube={onImportYoutube}
        onCreateTextSource={onCreateTextSource}
      />

      <SourcePreviewDialog
        source={previewSource}
        onClose={() => setPreviewSource(null)}
      />
    </div>
  );
}
