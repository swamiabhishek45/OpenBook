"use client";

import React from "react";
import { Workspace } from "@/hooks/use-workspaces";
import { WorkspaceCard } from "./workspace-card";
import { CreateWorkspaceCard } from "./create-workspace-card";
import { PANEL, META_CHIP } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

interface WorkspacesGridProps {
  workspaces: Workspace[];
  isLoading: boolean;
  pinnedIds: string[];
  menuOpenId: string | null;
  onMenuToggle: (workspaceId: string) => void;
  onCreateClick: () => void;
  onEdit: (workspace: Workspace, e: React.MouseEvent) => void;
  onTogglePin: (workspaceId: string, e: React.MouseEvent) => void;
  onDelete: (workspace: Workspace, e: React.MouseEvent) => void;
  searchQuery?: string;
}

const GRID = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

export function WorkspacesGrid({
  workspaces,
  isLoading,
  pinnedIds,
  menuOpenId,
  onMenuToggle,
  onCreateClick,
  onEdit,
  onTogglePin,
  onDelete,
  searchQuery,
}: WorkspacesGridProps) {
  const isSearchEmpty = !isLoading && !!searchQuery?.trim() && workspaces.length === 0;

  return (
    <section aria-labelledby="notebooks-title" className="space-y-5">
      <div className="flex items-center gap-2">
        <h2
          id="notebooks-title"
          className="text-[15px] font-semibold tracking-[-0.01em] text-foreground"
        >
          {searchQuery?.trim() ? "Search results" : "All notebooks"}
        </h2>
        {!isLoading && <span className={META_CHIP}>{workspaces.length}</span>}
      </div>

      {isLoading ? (
        <div className={GRID} aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(PANEL, "min-h-[208px] animate-pulse p-6")}
            >
              <div className="size-12 rounded-[16px] bg-card/70 dark:bg-white/6" />
              <div className="mt-5 h-5 w-40 rounded-full bg-card/70 dark:bg-white/6" />
              <div className="mt-2.5 h-4 w-52 rounded-full bg-card/50 dark:bg-white/4" />
              <div className="mt-10 h-4 w-24 rounded-full bg-card/40 dark:bg-white/3" />
            </div>
          ))}
        </div>
      ) : isSearchEmpty ? (
        <div className={cn(PANEL, "flex min-h-[208px] flex-col items-center justify-center p-10 text-center")}>
          <p className="text-[19px] font-semibold tracking-[-0.02em]">
            No notebooks match “{searchQuery?.trim()}”
          </p>
          <p className="mt-1.5 max-w-[320px] text-[14px] leading-[1.5] text-muted-foreground">
            Try a different title, or clear the search to see everything.
          </p>
        </div>
      ) : (
        <div className={GRID}>
          <CreateWorkspaceCard onClick={onCreateClick} />

          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              isPinned={pinnedIds.includes(ws.id)}
              isMenuOpen={menuOpenId === ws.id}
              onMenuToggle={onMenuToggle}
              onEdit={onEdit}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
