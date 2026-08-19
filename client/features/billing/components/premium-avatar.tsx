"use client";

import React from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanType } from "../types";

interface PremiumAvatarProps {
  plan?: PlanType | null;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function PremiumAvatar({
  plan = "FREE",
  children,
  className,
  size = "md",
  label,
}: PremiumAvatarProps) {
  const isPro = plan === "PRO";
  const isProPlus = plan === "PRO_PLUS";
  const isFree = !isPro && !isProPlus;

  const tooltip =
    label ||
    (isProPlus ? "PRO+ Member" : isPro ? "PRO Member" : "Free Account");

  // Free Tier: Nothing (no rings, no badges)
  if (isFree) {
    return (
      <div
        className={cn("relative inline-flex items-center justify-center shrink-0", className)}
        title={tooltip}
        aria-label={tooltip}
      >
        {children}
      </div>
    );
  }

  // Sizing config for badges
  const badgeSize =
    size === "sm"
      ? "w-3 h-3 text-[7px] -bottom-0.5 -right-0.5"
      : size === "lg"
      ? "w-4.5 h-4.5 text-[9px] -bottom-1 -right-1"
      : "w-3.5 h-3.5 text-[8px] -bottom-0.5 -right-0.5";

  const iconSize = size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-2.5 h-2.5" : "w-2 h-2";

  // PRO Tier: Sleek black/monochrome ring with black mini crown badge
  if (isPro) {
    return (
      <div
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full shrink-0 p-[1.5px] transition-all duration-300",
          "bg-linear-to-tr from-zinc-400 via-zinc-800 to-zinc-400 dark:from-zinc-700 dark:via-zinc-300 dark:to-zinc-700",
          "shadow-[0_0_6px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.08)]",
          className
        )}
        title={tooltip}
        aria-label={tooltip}
      >
        {/* Avatar Inner Content Container */}
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-card">
          {children}
        </div>

        {/* Integrated Sleek PRO Crown Badge */}
        <div
          className={cn(
            "absolute rounded-full bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-400 dark:border-zinc-700 flex items-center justify-center font-mono font-bold shadow-xs z-10",
            badgeSize
          )}
        >
          <Crown className={cn("stroke-[2.5]", iconSize)} />
        </div>
      </div>
    );
  }

  // PRO+ Tier: Luxury Golden Glittery double-ring with gold shimmer & gold crown badge
  return (
    <div
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full shrink-0 p-0.5 transition-all duration-300",
        "gold-glitter-ring shadow-[0_0_12px_rgba(234,179,8,0.45)]",
        className
      )}
      title={tooltip}
      aria-label={tooltip}
    >
      {/* Inner Gap / Second Ring Effect */}
      <div className="w-full h-full rounded-full p-px bg-background flex items-center justify-center">
        {/* Inner Avatar */}
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-card">
          {children}
        </div>
      </div>

      {/* Integrated Golden Glitter PRO+ Badge */}
      <div
        className={cn(
          "absolute rounded-full gold-glitter-badge text-amber-950 border border-amber-300/80 flex items-center justify-center font-mono font-black shadow-[0_0_6px_rgba(234,179,8,0.5)] z-10",
          badgeSize
        )}
      >
        <span className="flex items-center justify-center leading-none">
          <Crown className={cn("fill-amber-950 stroke-[1.5]", iconSize)} />
        </span>
      </div>
    </div>
  );
}

