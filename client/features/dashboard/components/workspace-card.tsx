"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { MoreVertical, Edit3, Pin, Trash2, ArrowRight } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Workspace } from "@/hooks/use-workspaces";
import {
  PANEL,
  RAISED,
  POPOVER,
  POPOVER_ITEM,
  iconButtonClassName,
} from "@/components/ui/pill";

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

  // Close the action menu when the click lands outside it.
  useEffect(() => {
    if (!isMenuOpen) return;
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onMenuToggle(workspace.id);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isMenuOpen, onMenuToggle, workspace.id]);

  return (
    <article
      className={cn(
        PANEL,
        "group relative flex min-h-[208px] flex-col p-6",
        "transition-[background-color,transform] duration-200 ease-out",
        "hover:bg-muted dark:hover:bg-muted",
        isPinned && "ring-1 ring-foreground/15 ring-inset",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className={cn(RAISED, "flex size-12 items-center justify-center rounded-[16px] text-[22px]")}
        >
          {workspace.icon || "📚"}
        </span>

        {/* z-10 keeps these above the heading's stretched-link overlay below. */}
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          {isPinned && (
            <Pin
              className="size-3.5 rotate-45 fill-foreground/70 text-foreground/70"
              aria-label="Pinned"
            />
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMenuToggle(workspace.id);
              }}
              title="Notebook actions"
              aria-label={`Actions for ${workspace.title}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className={cn(
                iconButtonClassName({ size: "sm" }),
                "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
                isMenuOpen && "bg-foreground/6 text-foreground opacity-100",
              )}
            >
              <MoreVertical className="size-4" />
            </button>

            {isMenuOpen && (
              <div
                className={cn(
                  POPOVER,
                  "animate-fadeIn absolute top-full right-0 z-40 mt-1.5 w-48",
                )}
              >
                <button
                  type="button"
                  onClick={(e) => onEdit(workspace, e)}
                  className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                >
                  <Edit3 className="size-4 text-muted-foreground" />
                  <span>Edit notebook</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => onTogglePin(workspace.id, e)}
                  className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                >
                  <Pin className="size-4 text-muted-foreground" />
                  <span>{isPinned ? "Unpin from top" : "Pin to top"}</span>
                </button>

                <div className="my-1 h-px bg-border/60" />

                <button
                  type="button"
                  onClick={(e) => onDelete(workspace, e)}
                  className={cn(POPOVER_ITEM, "text-destructive hover:bg-destructive/10")}
                >
                  <Trash2 className="size-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="mt-5 text-[19px] leading-[1.25] font-semibold tracking-[-0.02em]">
        {/* The whole card is the hit area; the heading carries the accessible name. */}
        <Link href={`/workspace/${workspace.id}`} className="line-clamp-2">
          <span className="absolute inset-0 rounded-[24px]" aria-hidden="true" />
          {workspace.title}
        </Link>
      </h3>

      <p className="mt-1.5 line-clamp-2 text-[14px] leading-[1.5] text-muted-foreground">
        {workspace.description || "No description yet."}
      </p>

      <div className="mt-auto flex items-center justify-between pt-6 text-[13px] text-muted-foreground">
        <span>{formatDate(workspace.updatedAt || workspace.createdAt)}</span>

        <span className="flex items-center gap-1 font-medium text-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5">
          Open
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </article>
  );
}
