"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OpenBookLogo } from "@/features/auth";
import { useAuth } from "@/features/auth";
import { WorkspaceDetail } from "../hooks/use-workspace";
import { useWorkspaces, Workspace } from "../hooks/use-workspaces";
import {
  ChevronDown,
  Sparkles,
  Layers,
  Check,
  LogOut,
  User,
  Settings,
  Brain,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface WorkspaceHeaderProps {
  workspace: WorkspaceDetail | null;
  sourcesCount: number;
  onUpdateTitle?: (title: string) => Promise<unknown>;
  onUpdateModel?: (model: string) => Promise<unknown>;
}

export function WorkspaceHeader({
  workspace,
  sourcesCount,
  onUpdateModel,
}: WorkspaceHeaderProps) {
  const router = useRouter();
  const { session, logoutMutation } = useAuth();
  const { workspaces } = useWorkspaces();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const workspaceId = workspace?.id || "";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: OpenBook logo + Workspace Switcher Dropdown */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard" className="shrink-0 flex items-center gap-2" title="Go to Dashboard">
          <OpenBookLogo size={22} textSize="text-base" textColor="text-foreground" />
        </Link>

        <div className="h-4 w-px bg-border shrink-0" />

        {/* Workspace Dropdown Switcher */}
        <div className="relative min-w-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer group max-w-[240px] sm:max-w-[320px]"
            title="Switch Workspace"
          >
            <span className="text-sm shrink-0">{workspace?.icon || "📚"}</span>
            <span className="text-xs sm:text-sm font-semibold truncate">
              {workspace?.title || "Untitled Notebook"}
            </span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl border border-border bg-card shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border">
                <span>Switch Notebook</span>
                <span className="font-mono text-[10px]">{workspaces.length} total</span>
              </div>

              {/* Workspaces List */}
              <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                {workspaces.map((ws: Workspace) => {
                  const isCurrent = ws.id === workspaceId;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (!isCurrent) {
                          router.push(`/workspace/${ws.id}`);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer",
                        isCurrent
                          ? "bg-foreground text-background font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm shrink-0">{ws.icon || "📚"}</span>
                        <span className="truncate">{ws.title}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="pt-1.5 border-t border-border">
                <Link
                  href="/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Dashboard · All Notebooks</span>
                </Link>
              </div>
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
              href={`/settings/memory`}
              className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Brain className="w-3 h-3" />
              <span>Memory</span>
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
