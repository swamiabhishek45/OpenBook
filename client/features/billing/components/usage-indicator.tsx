"use client";

import React from "react";
import { Zap, Layers, FileText, MessageSquare, Compass, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUsage } from "../hooks/use-usage";
import { useUpgradeModal } from "../stores/use-upgrade-modal";

export function UsageIndicator({
  variant = "compact",
}: {
  variant?: "compact" | "detailed";
}) {
  const { usage, plan, isPro, isProPlus, isLoading } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  if (isLoading || !usage) {
    return null;
  }

  const planLabel =
    plan === "PRO_PLUS"
      ? "Pro+ Plan"
      : plan === "PRO"
      ? "Pro Plan"
      : "Free Plan";

  if (variant === "compact") {
    const isAnyExceeded =
      usage.workspaces.exceeded ||
      usage.sources.exceeded ||
      usage.artifacts.exceeded ||
      usage.messages.exceeded;

    const chatText =
      usage.messages.limit === null
        ? "Unlimited Chats"
        : `${usage.messages.count}/${usage.messages.limit} Chats`;

    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() =>
          openUpgradeModal({
            reason: isAnyExceeded
              ? `You have reached your ${planLabel} limit. Upgrade for higher limits.`
              : "Upgrade your plan for higher limits and unlimited access.",
          })
        }
        className={`gap-1.5 text-xs font-normal border-border ${
          isAnyExceeded
            ? "border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10"
            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        {isProPlus ? (
          <Crown className="w-3 h-3 text-primary" />
        ) : (
          <Zap className="w-3 h-3 text-primary" />
        )}
        <span>
          {plan === "FREE" ? "Free" : plan === "PRO" ? "Pro" : "Pro+"}:{" "}
          {usage.workspaces.count}/{usage.workspaces.limit} WS • {chatText}
        </span>
      </Button>
    );
  }

  // Detailed widget (e.g. for sidebar or settings)
  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Usage & Limits</span>
        <Badge variant={isPro ? "default" : "secondary"} className="text-[10px] px-2 py-0.5">
          {planLabel}
        </Badge>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Workspaces */}
        <div>
          <div className="flex justify-between text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-foreground" /> Workspaces
            </span>
            <span className="font-mono text-[11px]">
              {usage.workspaces.count} / {usage.workspaces.limit}
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.workspaces.exceeded ? "bg-destructive" : "bg-primary"
              }`}
              style={{
                width: `${Math.min(
                  (usage.workspaces.count / (usage.workspaces.limit || 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Sources */}
        <div>
          <div className="flex justify-between text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-foreground" /> Sources
            </span>
            <span className="font-mono text-[11px]">
              {usage.sources.count} / {usage.sources.limit}
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.sources.exceeded ? "bg-destructive" : "bg-primary"
              }`}
              style={{
                width: `${Math.min(
                  (usage.sources.count / (usage.sources.limit || 3)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Artifacts */}
        <div>
          <div className="flex justify-between text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-foreground" /> Artifacts
            </span>
            <span className="font-mono text-[11px]">
              {usage.artifacts.count} / {usage.artifacts.limit}
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.artifacts.exceeded ? "bg-destructive" : "bg-primary"
              }`}
              style={{
                width: `${Math.min(
                  (usage.artifacts.count / (usage.artifacts.limit || 3)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Chat Messages */}
        <div>
          <div className="flex justify-between text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-foreground" /> Messages
            </span>
            <span className="font-mono text-[11px]">
              {usage.messages.limit === null
                ? `${usage.messages.count} (Unlimited)`
                : `${usage.messages.count} / ${usage.messages.limit}`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.messages.exceeded ? "bg-destructive" : "bg-primary"
              }`}
              style={{
                width:
                  usage.messages.limit === null
                    ? "100%"
                    : `${Math.min(
                        (usage.messages.count / (usage.messages.limit || 10)) * 100,
                        100
                      )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {!isProPlus && (
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() =>
            openUpgradeModal({
              reason: "Upgrade your plan for higher limits and unlimited access.",
            })
          }
          className="w-full gap-1.5 font-semibold text-xs mt-2"
        >
          <Zap className="w-3.5 h-3.5 fill-primary-foreground" />
          <span>{plan === "PRO" ? "Upgrade to Pro+ (₹499/mo)" : "Upgrade Plan"}</span>
        </Button>
      )}
    </div>
  );
}
