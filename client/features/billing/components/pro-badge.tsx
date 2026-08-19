"use client";

import React from "react";
import { Sparkles, Zap, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUsage } from "../hooks/use-usage";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { cn } from "@/lib/utils";

export function ProBadge({ className = "" }: { className?: string }) {
  const { isPro, isProPlus, isLoading } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  if (isLoading) {
    return (
      <div className={`h-6 w-16 bg-muted/60 animate-pulse rounded-full ${className}`} />
    );
  }

  // PRO+ Tier: Golden Glittery treatment with shimmer & sparkle
  if (isProPlus) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold select-none",
          "gold-glitter-badge text-amber-950 shadow-[0_0_14px_rgba(234,179,8,0.45)] border border-amber-300/80",
          "hover:brightness-105 transition-all duration-200 cursor-default",
          className
        )}
        title="PRO+ Member"
      >
        <Crown className="w-3.5 h-3.5 fill-amber-950 text-amber-950 shrink-0 stroke-[1.5]" />
        <span className="font-extrabold tracking-wider text-[11px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
          PRO+
        </span>
      </div>
    );
  }

  // PRO Tier: Sleek black pill badge
  if (isPro) {
    return (
      <Badge
        variant="default"
        className={cn(
          "gap-1.5 px-3 py-1 text-xs font-semibold rounded-full shadow-xs bg-zinc-950 text-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:border dark:border-zinc-800",
          className
        )}
        title="PRO Member"
      >
        <Crown className="w-3.5 h-3.5 fill-zinc-100 text-zinc-100 dark:fill-zinc-100 dark:text-zinc-100 shrink-0" />
        <span className="font-bold tracking-wider text-[11px]">PRO</span>
      </Badge>
    );
  }

  // Free Tier: Upgrade button
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      onClick={() => openUpgradeModal({ reason: "Upgrade to unlock more workspaces, sources, and unlimited chats." })}
      className={`group gap-1 text-xs font-medium border-border hover:bg-secondary transition-all ${className}`}
      title="Click to upgrade your subscription"
    >
      <Zap className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
      <span>Upgrade</span>
    </Button>
  );
}

