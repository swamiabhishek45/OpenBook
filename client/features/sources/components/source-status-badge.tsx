import React from "react";
import { cn } from "@/lib/utils";
import { SOURCE_STATUS_LABELS } from "../lib/constants";
import type { SourceStatus } from "../lib/types";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface SourceStatusBadgeProps {
  status: SourceStatus;
  className?: string;
  showIcon?: boolean;
}

export function SourceStatusBadge({
  status,
  className,
  showIcon = true,
}: SourceStatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case "READY":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "PROCESSING":
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "FAILED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    switch (status) {
      case "READY":
        return <CheckCircle2 className="w-2.5 h-2.5" />;
      case "PROCESSING":
      case "PENDING":
        return <Loader2 className="w-2.5 h-2.5 animate-spin" />;
      case "FAILED":
        return <AlertCircle className="w-2.5 h-2.5" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border capitalize select-none",
        getBadgeStyle(),
        className
      )}
    >
      {getIcon()}
      <span>{SOURCE_STATUS_LABELS[status] || status}</span>
    </span>
  );
}
