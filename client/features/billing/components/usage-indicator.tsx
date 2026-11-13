"use client";

import React from "react";
import Link from "next/link";
import { Coins, Plus, Upload, MessageSquare, BookOpen, Headphones } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useUsage } from "../hooks/use-usage";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { CREDIT_COSTS } from "../lib/plans";
import { cn } from "@/lib/utils";

export function UsageIndicator({
  variant = "compact",
}: {
  variant?: "compact" | "detailed";
}) {
  const { credits, isLoading } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  if (isLoading) {
    return null;
  }

  const isLow = credits < 10;

  if (variant === "compact") {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() =>
          openUpgradeModal({
            reason: isLow
              ? "Your credits are running low. Top up to continue research uninterrupted."
              : "Top up your OpenBook credits.",
            currentCredits: credits,
          })
        }
        className={cn(
          "gap-1.5 text-xs font-normal border-border transition-colors",
          isLow
            ? "border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10"
            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
        )}
      >
        <Coins className={cn("w-3.5 h-3.5 text-amber-500", isLow && "animate-bounce")} />
        <span className="font-medium text-foreground">{credits.toLocaleString("en-IN")} Credits</span>
        <span className="text-[10px] text-muted-foreground px-1 py-0.2 rounded bg-muted">
          Top up
        </span>
      </Button>
    );
  }

  // Detailed variant (e.g. in settings or sidebar flyouts)
  return (
    <div className="space-y-4 rounded-xl border border-border p-4 bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold">Credit Balance</span>
        </div>
        <span className="text-xs font-mono font-bold text-foreground">
          {credits.toLocaleString("en-IN")} cr
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Upload className="w-3 h-3 text-blue-500" /> Source upload
          </span>
          <span className="font-medium text-foreground">{CREDIT_COSTS.SOURCE_UPLOAD} cr</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-emerald-500" /> Chat query
          </span>
          <span className="font-medium text-foreground">{CREDIT_COSTS.CHAT_MESSAGE} cr</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-purple-500" /> Study artifact
          </span>
          <span className="font-medium text-foreground">{CREDIT_COSTS.ARTIFACT_GENERATE} cr</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Headphones className="w-3 h-3 text-rose-500" /> Audio debate
          </span>
          <span className="font-medium text-foreground">{CREDIT_COSTS.AUDIO_DEBATE} cr</span>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={() => openUpgradeModal({ currentCredits: credits })}
        className="w-full gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Top Up Credits (Min ₹50)</span>
      </Button>
    </div>
  );
}
