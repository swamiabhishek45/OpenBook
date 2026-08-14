import React from "react";
import {
  FileText,
  Globe,
  Video,
  Type,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceType } from "../lib/types";

const iconMap = {
  PDF: FileText,
  WEBSITE: Globe,
  YOUTUBE: Video,
  TEXT: Type,
  MARKDOWN: FileCode,
} as const;

interface SourceTypeIconProps {
  type: SourceType;
  className?: string;
}

export function SourceTypeIcon({ type, className }: SourceTypeIconProps) {
  const Icon = iconMap[type] || FileText;
  return <Icon className={cn("w-4 h-4 shrink-0", className)} />;
}
