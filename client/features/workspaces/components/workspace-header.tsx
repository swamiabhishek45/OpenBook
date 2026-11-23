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
  Layers,
  Check,
  LogOut,
  Brain,
  CreditCard,
  LayoutGrid,
  Puzzle,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { PremiumAvatar, ProBadge, useUpgradeModal, useUsage } from "@/features/billing";
import { UserAvatar } from "@/components/ui/user-avatar";
import { META_CHIP, POPOVER, POPOVER_ITEM } from "@/components/ui/pill";

interface WorkspaceHeaderProps {
  workspace: WorkspaceDetail | null;
  sourcesCount: number;
  onUpdateTitle?: (title: string) => Promise<unknown>;
  onUpdateModel?: (model: string) => Promise<unknown>;
}

export function WorkspaceHeader({
  workspace,
  sourcesCount,
}: WorkspaceHeaderProps) {
  const router = useRouter();
  const { session, logoutMutation } = useAuth();
  const { workspaces } = useWorkspaces();
  const { plan } = useUsage();

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
    <header className="z-20 shrink-0 px-3 pt-3 pb-2 select-none sm:px-4">
      {/* The same floating pill bar the landing page and dashboard use. */}
      <div className="flex h-[52px] items-center justify-between gap-2 rounded-full bg-muted/70 py-1.5 pr-1.5 pl-3 backdrop-blur-xl sm:pl-4 dark:bg-muted/60">
        {/* Left: logo + notebook switcher */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center"
            title="Go to dashboard"
          >
            <OpenBookLogo
              size={23}
              textSize="text-[16px]"
              textColor="text-foreground"
              textClassName="hidden sm:inline"
            />
          </Link>

          <div className="relative min-w-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              className={cn(
                "flex h-9 max-w-[130px] cursor-pointer items-center gap-1.5 rounded-full bg-card pr-2.5 pl-3 sm:max-w-[240px] md:max-w-[320px]",
                "text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-background",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              title="Switch notebook"
            >
              <span className="shrink-0 text-[14px]">{workspace?.icon || "📚"}</span>
              <span className="truncate text-[13.5px] font-medium">
                {workspace?.title || "Untitled notebook"}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                  isDropdownOpen && "rotate-180",
                )}
              />
            </button>

            {isDropdownOpen && (
              <div
                className={cn(POPOVER, "animate-fadeIn absolute top-full left-0 z-50 mt-2 w-72")}
              >
                <div className="flex items-center justify-between px-3 pt-1 pb-2">
                  <span className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                    Switch notebook
                  </span>
                  <span className={META_CHIP}>{workspaces.length}</span>
                </div>

                <div className="max-h-64 space-y-0.5 overflow-y-auto">
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
                          POPOVER_ITEM,
                          "justify-between",
                          isCurrent
                            ? "bg-foreground font-semibold text-background"
                            : "text-foreground hover:bg-foreground/6",
                        )}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="shrink-0 text-[14px]">{ws.icon || "📚"}</span>
                          <span className="truncate">{ws.title}</span>
                        </span>
                        {isCurrent && <Check className="size-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1 space-y-0.5 border-t border-border/60 pt-1">
                  {workspaceId && (
                    <Link
                      href={`/workspace/${workspaceId}/settings`}
                      onClick={() => setIsDropdownOpen(false)}
                      className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                    >
                      <Layers className="size-4 text-muted-foreground" />
                      <span>Notebook settings</span>
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                  >
                    <LayoutGrid className="size-4 text-muted-foreground" />
                    <span>All notebooks</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: plan, theme, account */}
        <div className="flex shrink-0 items-center gap-1.5">
          <ProBadge className="hidden md:inline-flex" />

          <ThemeToggle className="size-9 rounded-full border-0 bg-transparent shadow-none hover:bg-foreground/6" />

          {session?.user && (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                className="cursor-pointer rounded-full transition-transform duration-150 ease-out hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                title={session.user.name || "Account menu"}
              >
                <PremiumAvatar plan={plan} size="sm" className="size-8">
                  <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-card text-[11px] font-semibold text-foreground">
                    <UserAvatar src={session.user.image} name={session.user.name} />
                  </div>
                </PremiumAvatar>
              </button>

              {isProfileMenuOpen && (
                <div
                  className={cn(POPOVER, "animate-fadeIn absolute top-full right-0 z-50 mt-2 w-60")}
                >
                  <div className="flex items-center gap-2.5 px-3 pt-1.5 pb-3">
                    <PremiumAvatar plan={plan} size="md" className="size-9">
                      <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-foreground">
                        <UserAvatar src={session.user.image} name={session.user.name} />
                      </div>
                    </PremiumAvatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-foreground">
                        {session.user.name || "User"}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      openUpgradeModal({
                        reason:
                          "Top up your OpenBook credits to upload sources, chat, and generate artifacts.",
                      });
                    }}
                    className={cn(
                      POPOVER_ITEM,
                      "justify-between bg-foreground text-background hover:bg-foreground/88",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Coins className="size-4" />
                      <span>Top up credits</span>
                    </span>
                    <span className="font-mono text-[11px] text-background/70">
                      Min ₹50
                    </span>
                  </button>

                  {workspaceId && (
                    <div className="mt-1 space-y-0.5">
                      <Link
                        href={`/workspace/${workspaceId}/sources`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className={cn(
                          POPOVER_ITEM,
                          "justify-between text-foreground hover:bg-foreground/6",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="size-4 text-muted-foreground" />
                          <span>Library</span>
                        </span>
                        <span className={META_CHIP}>{sourcesCount}</span>
                      </Link>

                      <Link
                        href={`/workspace/${workspaceId}/memory`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                      >
                        <Brain className="size-4 text-muted-foreground" />
                        <span>Memory</span>
                      </Link>

                      <Link
                        href={`/workspace/${workspaceId}/billing`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                      >
                        <CreditCard className="size-4 text-muted-foreground" />
                        <span>Credits &amp; billing</span>
                      </Link>

                      <Link
                        href={`/workspace/${workspaceId}/integrations`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                      >
                        <Puzzle className="size-4 text-muted-foreground" />
                        <span>Integrations</span>
                      </Link>
                    </div>
                  )}

                  <div className="mt-1 border-t border-border/60 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logoutMutation.mutate();
                      }}
                      className={cn(POPOVER_ITEM, "text-destructive hover:bg-destructive/10")}
                    >
                      <LogOut className="size-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
