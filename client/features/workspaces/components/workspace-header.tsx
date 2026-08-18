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
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProBadge, useUpgradeModal, useUsage } from "@/features/billing";


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
  const { isPro, isProPlus } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const workspaceId = workspace?.id || "";

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: OpenBook logo + Workspace Switcher Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link href="/dashboard" className="shrink-0 flex items-center gap-2" title="Go to Dashboard">
          <OpenBookLogo size={22} textSize="text-base" textColor="text-foreground" textClassName="hidden sm:inline" />
        </Link>

        <div className="h-4 w-px bg-border shrink-0" />

        {/* Workspace Dropdown Switcher */}
        <div className="relative min-w-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 py-1 px-2 sm:px-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer group max-w-[130px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-[320px]"
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

        {/* Model dropdown - hidden on mobile/tablet screens */}
        <select
          value={workspace?.defaultModel || "gpt-4o-mini"}
          onChange={(e) => onUpdateModel?.(e.target.value)}
          className="hidden md:block px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/80 transition-colors font-medium"
          title="Select AI Model"
        >
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
        </select>

        {/* Pro Plan Badge */}
        <ProBadge />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile dropdown button & popover menu */}
        {session?.user && (
          <div className="relative pl-1 sm:pl-2 border-l border-border" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-7 h-7 rounded-full bg-muted border border-border hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center justify-center text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-xs overflow-hidden shrink-0"
              title="User menu"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : session.user.name ? (
                session.user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Profile Dropdown Popover Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-2xl p-1.5 z-50 animate-fadeIn text-xs space-y-1">
                {/* Header User Info */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground overflow-hidden shrink-0">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "Profile"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : session.user.name ? (
                      session.user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {/* Upgrade prompt if not on highest tier */}
                {!isProPlus && (
                  <div className="p-1 border-b border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        openUpgradeModal({
                          reason: "Upgrade your subscription for higher workspace, source, and artifact limits.",
                        });
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors font-medium cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span className="text-xs font-semibold">
                          {isPro ? "Upgrade to Pro+" : "Upgrade Plan"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold bg-background border border-border px-1.5 py-0.5 rounded text-foreground">
                        {isPro ? "₹499" : "₹199"}
                      </span>
                    </button>
                  </div>
                )}



                {/* Workspace Navigation Links (Library, Memory, Settings) */}
                <div className="space-y-0.5 pt-1">
                  {workspaceId && (
                    <Link
                      href={`/workspace/${workspaceId}/sources`}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Library</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                        {sourcesCount}
                      </span>
                    </Link>
                  )}

                  <Link
                    href="/settings/memory"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-medium"
                  >
                    <Brain className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Memory</span>
                  </Link>

                  {workspaceId && (
                    <Link
                      href={`/workspace/${workspaceId}/settings`}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  )}
                </div>

                {/* Divider & Logout */}
                <div className="pt-1 border-t border-border">

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logoutMutation.mutate();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-medium text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
