"use client";

import React from "react";
import { Plus } from "lucide-react";
import { GooeyInput } from "@/components/ui/gooey-input";

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
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground font-sans">
          Welcome back, {userName || "Explorer"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Organize your research, notes, and sources with AI-powered synthesis.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <GooeyInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notebooks..."
        />

        <button
          onClick={onNewNotebook}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 active:scale-95 rounded-xl text-xs font-medium transition-all shadow-xs shrink-0 cursor-pointer h-10"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Notebook</span>
        </button>
      </div>
    </div>
  );
}
