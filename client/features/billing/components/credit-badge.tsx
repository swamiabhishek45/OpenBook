"use client";

import { Coins, Plus } from "lucide-react";
import { useUsage } from "../hooks/use-usage";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { pillClassName } from "@/components/ui/pill";
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
      <span
        className={cn(
          pillClassName({ variant: "chip", size: "sm" }),
          "animate-pulse text-muted-foreground",
          className,
        )}
      >
        <Coins className="size-3.5" />
        <span>Loading…</span>
      </span>
    );
  }

  // Borderless tints: the balance still reads at a glance, but the chip stays
  // as quiet as the rest of the pill chrome around it.
  const isLow = credits < 10;
  const isMedium = credits >= 10 && credits <= 50;

  const tone = isLow
    ? "bg-rose-500/12 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
    : isMedium
      ? "bg-amber-500/12 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
      : "bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400";

  return (
    <button
      type="button"
      onClick={() =>
        openUpgradeModal({
          reason: "Top up your OpenBook credits",
          currentCredits: credits,
        })
      }
      title={`${credits} credits available. Click to top up.`}
      className={cn(
        pillClassName({ variant: "chip", size: "sm" }),
        "group cursor-pointer gap-1.5",
        tone,
        className,
      )}
    >
      <Coins className="size-3.5" />
      <span>{credits.toLocaleString("en-IN")} credits</span>
      {showPlusButton && (
        <span
          aria-hidden="true"
          className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-background/60 transition-transform duration-150 ease-out group-hover:scale-110"
        >
          <Plus className="size-2.5" />
        </span>
      )}
    </button>
  );
}
