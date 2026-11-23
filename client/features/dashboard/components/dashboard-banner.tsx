"use client";

import React from "react";
import { NotebookText, Plus, Search, X } from "lucide-react";
import {
  IconTile,
  PillButton,
  SOFT_INPUT,
  iconButtonClassName,
} from "@/components/ui/pill";
import { cn } from "@/lib/utils";

interface DashboardBannerProps {
  userName?: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewNotebook: () => void;
}

export function DashboardBanner({
  userName,
  searchQuery,
  onSearchChange,
  onNewNotebook,
}: DashboardBannerProps) {
  const firstName = userName?.trim().split(/\s+/)[0] || "Explorer";

  return (
    <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[15px] text-muted-foreground">Your notebooks</p>

        <h1 className="mt-2.5 text-[clamp(32px,4.4vw,52px)] leading-[1.1] font-semibold tracking-[-0.04em] text-balance">
          Welcome back,{" "}
          <IconTile tone="ink" tilt={-4}>
            <NotebookText strokeWidth={2.2} />
          </IconTile>{" "}
          {/* The name fades from ink to muted, as on the landing hero. */}
          <span className="bg-linear-to-b from-foreground from-30% to-muted-foreground/55 bg-clip-text pb-[0.08em] text-transparent">
            {firstName}.
          </span>
        </h1>

        <p className="mt-3.5 max-w-[520px] text-[16px] leading-[1.55] text-muted-foreground">
          Pick up a notebook, or start a new one. Everything you add stays cited and
          searchable.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notebooks"
            aria-label="Search notebooks"
            className={cn(
              SOFT_INPUT,
              "h-11 pl-10",
              searchQuery ? "pr-11" : "pr-4",
              "[&::-webkit-search-cancel-button]:hidden",
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className={cn(
                iconButtonClassName({ size: "sm" }),
                "absolute top-1/2 right-2 -translate-y-1/2",
              )}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <PillButton onClick={onNewNotebook} size="md">
          <Plus className="size-4" strokeWidth={2.4} />
          <span>New notebook</span>
        </PillButton>
      </div>
    </div>
  );
}
