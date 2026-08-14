"use client";

import React, { useState } from "react";
import { Source } from "../types";
import { SourceItem } from "./source-item";
import { AddSourceDialog } from "./add-source-dialog";
import { SourcePreviewDialog } from "./source-preview-dialog";
import {
  Plus,
  Search,
  CheckSquare,
  Square,
  FileBox,
  Layers,
  Sparkles,
} from "lucide-react";

interface SourcesPanelProps {
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

  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected =
    sources.length > 0 && selectedSourceIds.length === sources.length;

  return (
    <div className="h-full flex flex-col bg-card border-r border-border text-foreground select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Sources
          </span>
          <span className="px-1.5 py-0.2 bg-muted text-[11px] rounded text-muted-foreground font-mono">
            {sources.length}
          </span>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-primary hover:opacity-90 text-primary-foreground rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Sub-header: Search & Select All toggle */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources..."
            className="w-full pl-8 pr-3 py-1 bg-muted/60 border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {sources.length > 0 && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
            <button
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-foreground" />
              ) : (
                <Square className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span>{allSelected ? "Deselect all" : "Select all for chat"}</span>
            </button>

            <span className="font-mono text-muted-foreground">
              {selectedSourceIds.length}/{sources.length} active
            </span>
          </div>
        )}
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-muted/40 border border-border animate-pulse"
              />
            ))}
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-3">
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <FileBox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">No sources yet</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[180px]">
                Add PDFs, websites, or YouTube links to ground this notebook.
              </p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-border"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Source</span>
            </button>
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
            />
          ))
        )}
      </div>

      {/* Footer Grounding Info */}
      <div className="p-3 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Sparkles className="w-3 h-3 text-foreground" />
          <span>AI Grounding</span>
        </span>
        <span>
          {selectedSourceIds.length > 0
            ? `${selectedSourceIds.length} sources enabled`
            : "No sources active"}
        </span>
      </div>

      {/* Add Source Dialog Modal */}
      <AddSourceDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onUploadPdf={onUploadPdf}
        onImportWebsite={onImportWebsite}
        onImportYoutube={onImportYoutube}
        onCreateTextSource={onCreateTextSource}
      />

      {/* Source Preview Dialog Modal */}
      <SourcePreviewDialog
        source={previewSource}
        onClose={() => setPreviewSource(null)}
      />
    </div>
  );
}
