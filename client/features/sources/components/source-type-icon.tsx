import {
  FileText,
  Globe,
  Type,
  FileCode,
  BookOpen,
} from "lucide-react";

import { YoutubeIcon } from "@/components/ui/youtube-icon";
import { cn } from "@/lib/utils";
import type { SourceType } from "../lib/types";

const iconMap = {
  PDF: FileText,
  WEBSITE: Globe,
  YOUTUBE: YoutubeIcon,
  TEXT: Type,
  MARKDOWN: FileCode,
  GOOGLE_DOC: FileText,
  NOTION_PAGE: BookOpen,
} as const;


interface SourceTypeIconProps {
  type: SourceType;
  className?: string;
}

export function SourceTypeIcon({ type, className }: SourceTypeIconProps) {
  const Icon = iconMap[type] || FileText;
  return <Icon className={cn("w-4 h-4 shrink-0 text-zinc-800 dark:text-zinc-200", className)} />;
}
