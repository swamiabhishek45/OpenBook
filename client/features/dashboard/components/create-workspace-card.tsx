"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWorkspaceCardProps {
  onClick: () => void;
}

export function CreateWorkspaceCard({ onClick }: CreateWorkspaceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[208px] cursor-pointer flex-col rounded-[24px] bg-foreground p-6 text-left text-background",
        "transition-[background-color,transform] duration-200 ease-out",
        "hover:bg-foreground/90 active:scale-[0.99]",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-[16px] bg-background/12 text-background transition-transform duration-200 ease-out group-hover:rotate-90"
      >
        <Plus className="size-6" strokeWidth={2.2} />
      </span>

      <span className="mt-5 text-[19px] leading-[1.25] font-semibold tracking-[-0.02em]">
        New notebook
      </span>

      <span className="mt-1.5 text-[14px] leading-[1.5] text-background/65">
        Start from PDFs, web pages, YouTube, Drive, Notion, or GitHub.
      </span>

      <span className="mt-auto pt-6 text-[13px] font-medium text-background/80">
        Create
      </span>
    </button>
  );
}
