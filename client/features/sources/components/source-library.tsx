"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  BookOpen,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  useBulkDeleteSources,
  useDeleteSource,
  useReprocessSources,
  useSources,
} from "../hooks/use-sources";
import {
  SOURCE_STATUS_LABELS,
  SOURCE_STATUSES,
  SOURCE_TYPE_LABELS,
  SOURCE_TYPES,
} from "../lib/constants";
import type { Source, SourceFilters, SourceStatus, SourceType } from "../lib/types";
import { AddSourceDialog } from "./add-source-dialog";
import { SourceCard } from "./source-card";
import { SourcePreviewDialog } from "./source-preview-dialog";
import { cn } from "@/lib/utils";

interface SourceLibraryProps {
  workspaceId: string;
}

export function SourceLibrary({ workspaceId }: SourceLibraryProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const [filters, setFilters] = useState<SourceFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setIsTypeOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: sources, isLoading, error } = useSources(workspaceId, filters);
  const deleteSourceMutation = useDeleteSource(workspaceId);
  const bulkDeleteMutation = useBulkDeleteSources(workspaceId);
  const reprocessFailedMutation = useReprocessSources(workspaceId);

  const failedCount =
    sources?.filter((source) => source.status === "FAILED").length ?? 0;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.q?.trim()) count += 1;
    if (filters.type) count += 1;
    if (filters.status) count += 1;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  function clearFilters() {
    setFilters({});
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds([]);
  }

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Source Library
          </h2>
          <p className="text-xs text-muted-foreground">
            {sources
              ? `${sources.length} source${sources.length === 1 ? "" : "s"} in this workspace`
              : "All knowledge sources in this workspace"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-foreground text-background hover:opacity-90 active:scale-[0.99] transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative min-w-0 flex-1">
            <Search className="absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search sources..."
              value={filters.q || ""}
              onChange={(e) =>
                setFilters((curr) => ({ ...curr, q: e.target.value }))
              }
            />
          </div>

          {/* Type & Status Selects & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Custom Type Dropdown */}
            <div className="relative" ref={typeRef}>
              <button
                type="button"
                onClick={() => {
                  setIsTypeOpen(!isTypeOpen);
                  setIsStatusOpen(false);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {filters.type ? SOURCE_TYPE_LABELS[filters.type] : "All Types"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                    isTypeOpen && "rotate-180"
                  )}
                />
              </button>

              {isTypeOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-40 rounded-xl border border-border bg-card shadow-2xl p-1 z-30 animate-fadeIn space-y-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((curr) => ({ ...curr, type: undefined }));
                      setIsTypeOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                      !filters.type
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>All Types</span>
                    {!filters.type && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>

                  {SOURCE_TYPES.map((t) => {
                    const isSelected = filters.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setFilters((curr) => ({ ...curr, type: t }));
                          setIsTypeOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background font-semibold"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span>{SOURCE_TYPE_LABELS[t]}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Status Dropdown */}
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsTypeOpen(false);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {filters.status ? SOURCE_STATUS_LABELS[filters.status] : "All Statuses"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                    isStatusOpen && "rotate-180"
                  )}
                />
              </button>

              {isStatusOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-40 rounded-xl border border-border bg-card shadow-2xl p-1 z-30 animate-fadeIn space-y-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((curr) => ({ ...curr, status: undefined }));
                      setIsStatusOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                      !filters.status
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>All Statuses</span>
                    {!filters.status && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>

                  {SOURCE_STATUSES.map((s) => {
                    const isSelected = filters.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setFilters((curr) => ({ ...curr, status: s }));
                          setIsStatusOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background font-semibold"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span>{SOURCE_STATUS_LABELS[s]}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-border bg-card p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors",
                  view === "grid"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors",
                  view === "list"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selection Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                if (selectionMode) exitSelectionMode();
                else setSelectionMode(true);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              {selectionMode ? "Done" : "Select"}
            </button>

            {/* Reprocess Failed Button */}
            {failedCount > 0 && (
              <button
                type="button"
                disabled={reprocessFailedMutation.isPending}
                onClick={() => void reprocessFailedMutation.mutateAsync(undefined)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={cn(
                    "w-3.5 h-3.5",
                    reprocessFailedMutation.isPending && "animate-spin"
                  )}
                />
                <span>Reprocess Failed ({failedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs hover:text-foreground underline"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/* Selection Toolbar */}
        {selectionMode && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40 text-xs">
            <span className="text-muted-foreground">
              {selectedIds.length} source{selectedIds.length === 1 ? "" : "s"} selected
            </span>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  disabled={bulkDeleteMutation.isPending}
                  onClick={() => {
                    if (confirm(`Delete ${selectedIds.length} selected sources?`)) {
                      void bulkDeleteMutation.mutateAsync(selectedIds).then(exitSelectionMode);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected
                </button>
              )}
              <button
                type="button"
                onClick={exitSelectionMode}
                className="px-2.5 py-1 text-xs rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sources Grid / List Content */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-dashed border-destructive/30 rounded-2xl bg-destructive/5 text-destructive text-xs">
          Could not load sources. Please try again.
        </div>
      ) : sources && sources.length > 0 ? (
        <div
          className={cn(
            "grid gap-3",
            view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          {sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              selected={selectedIds.includes(source.id)}
              onToggleSelect={selectionMode ? toggleSelectId : undefined}
              onSelect={(s) => setPreviewSource(s)}
              onDelete={(s) => {
                if (confirm(`Delete "${s.title}"?`)) {
                  deleteSourceMutation.mutate(s.id);
                }
              }}
              onReprocess={
                source.status === "FAILED"
                  ? (s) => reprocessFailedMutation.mutate([s.id])
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-3">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">No sources found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Add your first source to ground this workspace."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Source
          </button>
        </div>
      )}

      {/* Add Source Dialog */}
      <AddSourceDialog
        workspaceId={workspaceId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {/* Preview Dialog */}
      <SourcePreviewDialog
        source={previewSource}
        onClose={() => setPreviewSource(null)}
      />
    </div>
  );
}
