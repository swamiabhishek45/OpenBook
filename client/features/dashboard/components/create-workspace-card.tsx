"use client";

import React from "react";
import { Plus } from "lucide-react";

interface CreateWorkspaceCardProps {
  onClick: () => void;
}

export function CreateWorkspaceCard({ onClick }: CreateWorkspaceCardProps) {
  return (
    <button
      onClick={onClick}
      className="group h-44 rounded-xl border border-dashed border-border hover:border-zinc-500 bg-card hover:bg-muted/40 p-5 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full border border-border group-hover:border-zinc-400 bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors mb-3">
        <Plus className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-foreground transition-colors">
        Create New Workspace
      </span>
      <span className="text-xs text-muted-foreground mt-1">
        Upload PDFs, audio, YouTube &amp; web links
      </span>
    </button>
  );
}
