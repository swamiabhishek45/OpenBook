"use client";

import React, { useState } from "react";
import {
  FileText,
  Globe,
  Type,
  FileCode,
  BookOpen,
} from "lucide-react";

import { YoutubeIcon } from "@/components/ui/youtube-icon";
import { GithubIcon } from "@/components/ui/github-icon";
import { cn } from "@/lib/utils";
import type { Source, SourceType } from "../lib/types";
import { getWebsiteFaviconUrl } from "../lib/favicon";

const iconMap = {
  PDF: FileText,
  WEBSITE: Globe,
  YOUTUBE: YoutubeIcon,
  TEXT: Type,
  MARKDOWN: FileCode,
  GOOGLE_DOC: FileText,
  NOTION_PAGE: BookOpen,
  GITHUB_REPO: GithubIcon,
} as const;

interface SourceTypeIconProps {
  type: SourceType;
  className?: string;
  /** When provided, WEBSITE sources show the site favicon when available. */
  source?: Pick<Source, "type" | "url" | "metadata"> | null;
}

export function SourceTypeIcon({ type, className, source }: SourceTypeIconProps) {
  const [faviconFailed, setFaviconFailed] = useState(false);

  const faviconUrl =
    source && type === "WEBSITE" && !faviconFailed
      ? getWebsiteFaviconUrl(source as Source)
      : null;

  if (faviconUrl) {
    return (
      <img
        src={faviconUrl}
        alt=""
        width={16}
        height={16}
        className={cn("w-4 h-4 shrink-0 rounded-sm object-contain", className)}
        onError={() => setFaviconFailed(true)}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const Icon = iconMap[type] || FileText;
  return (
    <Icon
      className={cn(
        "w-4 h-4 shrink-0 text-zinc-800 dark:text-zinc-200",
        className
      )}
    />
  );
}
