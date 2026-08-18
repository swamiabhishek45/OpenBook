"use client";

import React from "react";
import { Workspace } from "@/hooks/use-workspaces";
import { WorkspaceCard } from "./workspace-card";
import { CreateWorkspaceCard } from "./create-workspace-card";

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
}

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
}: WorkspacesGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Your Workspaces ({workspaces.length})
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-border bg-card animate-pulse p-5 space-y-3"
            >
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted/60 rounded" />
              <div className="h-4 w-20 bg-muted/40 rounded mt-8" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Notebook Card */}
          <CreateWorkspaceCard onClick={onCreateClick} />

          {/* Workspace Cards */}
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
    </div>
  );
}
