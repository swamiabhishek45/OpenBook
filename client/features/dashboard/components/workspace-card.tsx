"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreVertical,
  Edit3,
  Pin,
  Trash2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Workspace } from "@/hooks/use-workspaces";

interface WorkspaceCardProps {
  workspace: Workspace;
  isPinned: boolean;
  isMenuOpen: boolean;
  onMenuToggle: (workspaceId: string) => void;
  onEdit: (workspace: Workspace, e: React.MouseEvent) => void;
  onTogglePin: (workspaceId: string, e: React.MouseEvent) => void;
  onDelete: (workspace: Workspace, e: React.MouseEvent) => void;
}

export function WorkspaceCard({
  workspace,
  isPinned,
  isMenuOpen,
  onMenuToggle,
  onEdit,
  onTogglePin,
  onDelete,
}: WorkspaceCardProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "group relative h-44 rounded-xl border bg-card p-5 flex flex-col justify-between transition-all duration-200 shadow-xs",
        isPinned
          ? "border-primary/40 bg-card hover:border-primary/60"
          : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-muted/30"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-base shrink-0">
              {workspace.icon || "📚"}
            </div>
            <div className="min-w-0 flex-1 flex items-center gap-1.5">
              <Link
                href={`/workspace/${workspace.id}`}
                className="font-medium text-sm text-foreground hover:underline truncate"
              >
                {workspace.title}
              </Link>
              {isPinned && (
                <Pin className="w-3 h-3 text-primary fill-primary shrink-0 rotate-45" />
              )}
            </div>
          </div>

          {/* Three Dots Menu Container */}
          <div className="relative shrink-0" ref={isMenuOpen ? menuRef : undefined}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMenuToggle(workspace.id);
              }}
              title="Notebook actions"
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Action Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-xl py-1.5 z-40 text-xs text-foreground animate-fadeIn">
                <button
                  type="button"
                  onClick={(e) => onEdit(workspace, e)}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Edit Notebook</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => onTogglePin(workspace.id, e)}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  <Pin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isPinned ? "Unpin from top" : "Pin to top"}</span>
                </button>

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={(e) => onDelete(workspace, e)}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
          {workspace.description || "No description provided."}
        </p>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(workspace.updatedAt || workspace.createdAt)}
        </span>

        <Link
          href={`/workspace/${workspace.id}`}
          className="flex items-center gap-1 text-foreground font-medium hover:underline"
        >
          <span>Open</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
