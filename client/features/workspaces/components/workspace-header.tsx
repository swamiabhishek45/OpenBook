"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OpenBookLogo } from "@/features/auth";
import { useAuth } from "@/features/auth";
import { WorkspaceDetail } from "../hooks/use-workspace";
import {
  ChevronLeft,
  Sparkles,
  Layers,
  Edit2,
  Check,
  X,
  LogOut,
  User,
  Settings,
  Brain,
} from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";

interface WorkspaceHeaderProps {
  workspace: WorkspaceDetail | null;
  sourcesCount: number;
  onUpdateTitle: (title: string) => Promise<unknown>;
  onUpdateModel?: (model: string) => Promise<unknown>;
}

export function WorkspaceHeader({
  workspace,
  sourcesCount,
  onUpdateTitle,
  onUpdateModel,
}: WorkspaceHeaderProps) {
  const { session, logoutMutation } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(workspace?.title || "");

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === workspace?.title) {
      setIsEditingTitle(false);
      return;
    }
    await onUpdateTitle(editedTitle.trim());
    setIsEditingTitle(false);
  };

  const workspaceId = workspace?.id || "";

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: OpenBook logo + Editable Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard" className="shrink-0 flex items-center gap-2" title="Go to Dashboard">
          <OpenBookLogo size={22} textSize="text-base" textColor="text-foreground" />
        </Link>

        <div className="h-4 w-px bg-border shrink-0" />

        {/* Title / Inline edit */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                className="px-2 py-0.5 bg-muted border border-border rounded text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 text-emerald-500 hover:bg-muted rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-muted-foreground hover:bg-muted rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setEditedTitle(workspace?.title || "");
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 cursor-pointer group py-1 px-2 rounded-lg hover:bg-muted/80 transition-colors min-w-0"
            >
              <span className="text-sm shrink-0">{workspace?.icon || "📚"}</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {workspace?.title || "Untitled Notebook"}
              </span>
              <Edit2 className="w-3 h-3 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
            </div>
          )}
        </div>
      </div>

      {/* Middle/Right Quick Tabs & Controls */}
      <div className="flex items-center gap-2">
        {workspaceId && (
          <div className="hidden xl:flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border text-[11px]">
            <Link
              href={`/workspace/${workspaceId}/sources`}
              className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              <span>Library ({sourcesCount})</span>
            </Link>
            <Link
              href={`/workspace/${workspaceId}/learn`}
              className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Studio</span>
            </Link>
            <Link
              href={`/settings/memory`}
              className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Brain className="w-3 h-3" />
              <span>Mem0</span>
            </Link>
            <Link
              href={`/workspace/${workspaceId}/settings`}
              className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Settings</span>
            </Link>
          </div>
        )}

        {/* Model dropdown */}
        <select
          value={workspace?.defaultModel || "gpt-4o-mini"}
          onChange={(e) => onUpdateModel?.(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/80 transition-colors font-medium"
          title="Select AI Model"
        >
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
        </select>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile dropdown pill */}
        {session?.user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-foreground">
              {session.user.name ? (
                session.user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-3 h-3" />
              )}
            </div>

            <button
              onClick={() => logoutMutation.mutate()}
              title="Sign out"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
