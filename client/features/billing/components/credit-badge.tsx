"use client";

import { Coins, Plus } from "lucide-react";
import { useUsage } from "../hooks/use-usage";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { cn } from "@/lib/utils";

interface CreditBadgeProps {
  className?: string;
  showPlusButton?: boolean;
}

export function CreditBadge({ className, showPlusButton = true }: CreditBadgeProps) {
  const { credits, isLoading } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  if (isLoading) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-muted/60 text-muted-foreground animate-pulse border border-border/50", className)}>
        <Coins className="w-3.5 h-3.5" />
        <span>Loading...</span>
      </div>
    );
  }

  // Color cues based on balance
  const isLow = credits < 10;
  const isMedium = credits >= 10 && credits <= 50;

  const colorClasses = isLow
    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
    : isMedium
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20";

  return (
    <button
      type="button"
      onClick={() => openUpgradeModal({ reason: "Top up your OpenBook credits", currentCredits: credits })}
      title={`${credits} credits available. Click to top up.`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer group shadow-2xs",
        colorClasses,
        className
      )}
    >
      <Coins className={cn("w-3.5 h-3.5", isLow && "animate-bounce")} />
      <span>{credits.toLocaleString("en-IN")} Credits</span>
      {showPlusButton && (
        <span className="w-4 h-4 rounded-full bg-background/50 flex items-center justify-center ml-0.5 group-hover:scale-110 transition-transform">
          <Plus className="w-2.5 h-2.5" />
        </span>
      )}
    </button>
  );
}

