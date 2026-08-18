"use client";

import React from "react";
import { Sparkles, Zap, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUsage } from "../hooks/use-usage";
import { useUpgradeModal } from "../stores/use-upgrade-modal";

export function ProBadge({ className = "" }: { className?: string }) {
  const { plan, isPro, isProPlus, isLoading } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  if (isLoading) {
    return (
      <div className={`h-6 w-16 bg-muted/60 animate-pulse rounded-full ${className}`} />
    );
  }

  if (isProPlus) {
    return (
      <Badge
        variant="default"
        className={`gap-1.5 px-2.5 py-0.5 text-xs font-semibold shadow-xs bg-primary text-primary-foreground ${className}`}
      >
        <Crown className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
        <span>PRO+</span>
      </Badge>
    );
  }

  if (isPro) {
    return (
      <Badge
        variant="default"
        className={`gap-1.5 px-2.5 py-0.5 text-xs font-semibold shadow-xs ${className}`}
      >
        <Sparkles className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
        <span>PRO</span>
      </Badge>
    );
  }

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
