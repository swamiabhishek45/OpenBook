"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";
import { useUsage } from "../hooks/use-usage";
import { useRazorpayCheckout } from "../hooks/use-razorpay";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { UsageIndicator } from "./usage-indicator";
import type { PlanType } from "../types";

const PLAN_DETAILS: Record<
  PlanType,
  { label: string; price: string; priceShort: string; description: string }
> = {
  FREE: {
    label: "Free",
    price: "₹0",
    priceShort: "₹0",
    description: "Core research tools with starter limits.",
  },
  PRO: {
    label: "Pro",
    price: "₹199/mo",
    priceShort: "₹199",
    description: "More workspaces, sources, and unlimited chats.",
  },
  PRO_PLUS: {
    label: "Pro+",
    price: "₹499/mo",
    priceShort: "₹499",
    description: "Highest limits for power researchers.",
  },
};

function formatExpiry(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysUntil(iso: string | null | undefined) {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}

export function BillingSettingsView() {
  const { usage, plan, isPro, isProPlus, isLoading, isError } = useUsage();
  const { checkout, isLoading: checkoutLoading } = useRazorpayCheckout();
  const { openUpgradeModal } = useUpgradeModal();

  const subscriptionPlan = usage?.subscriptionPlan ?? plan;
  const subscriptionExpired = usage?.subscriptionExpired ?? false;
  const displayPlan: PlanType =
    subscriptionPlan !== "FREE" ? subscriptionPlan : plan;

  const current = PLAN_DETAILS[displayPlan];
  const expiryLabel = formatExpiry(usage?.planExpiresAt);
  const daysLeft = daysUntil(usage?.planExpiresAt);

  const nextPlan: "PRO" | "PRO_PLUS" | null =
    plan === "FREE" && !subscriptionExpired
      ? subscriptionPlan === "PRO_PLUS"
        ? null
        : subscriptionPlan === "PRO"
          ? "PRO_PLUS"
          : "PRO"
      : plan === "PRO"
        ? "PRO_PLUS"
        : null;

  const renewPlan: "PRO" | "PRO_PLUS" | null =
    subscriptionPlan === "PRO" || subscriptionPlan === "PRO_PLUS"
      ? subscriptionPlan
      : null;

  const showRenewSoon =
    !subscriptionExpired &&
    renewPlan &&
    daysLeft !== null &&
    daysLeft <= 7 &&
    daysLeft >= 0;

  const anyExceeded =
    usage &&
    (usage.workspaces.exceeded ||
      usage.sources.exceeded ||
      usage.artifacts.exceeded ||
      usage.messages.exceeded);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 p-12 text-muted-foreground">
        <ThemeLoader size={32} />
        <span className="text-xs">Loading billing details...</span>
      </div>
    );
  }

  if (isError || !usage) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load your subscription. Try again from the dashboard.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-foreground" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Billing &amp; plan
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Renew monthly via Razorpay, upgrade tiers, and track usage in one place.
          </p>
        </div>
      </div>

      {subscriptionExpired && renewPlan && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          Your {PLAN_DETAILS[renewPlan].label} subscription ended
          {expiryLabel ? ` on ${expiryLabel}` : ""}. Renew to restore Pro limits
          and unlimited chat.
        </div>
      )}

      {showRenewSoon && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
          Your plan expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}. Renew
          now to avoid dropping to Free limits.
        </div>
      )}

      {anyExceeded && !subscriptionExpired && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          You have reached at least one limit on your current plan. Upgrade to
          continue adding workspaces, sources, or messages.
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {subscriptionExpired ? "Subscription" : "Current plan"}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {displayPlan === "PRO_PLUS" ? (
                <Crown className="w-5 h-5 text-primary" />
              ) : displayPlan === "PRO" ? (
                <Zap className="w-5 h-5 text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-2xl font-bold text-foreground">
                {current.label}
              </span>
              <Badge
                variant={displayPlan !== "FREE" ? "default" : "secondary"}
                className="text-[10px]"
              >
                {current.price}
              </Badge>
              {subscriptionExpired && (
                <Badge variant="destructive" className="text-[10px]">
                  Expired
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              {subscriptionExpired
                ? `You are on Free limits until you renew ${current.label}.`
                : current.description}
            </p>
          </div>

          {renewPlan && expiryLabel && !subscriptionExpired && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>
                Active through{" "}
                <strong className="text-foreground">{expiryLabel}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {renewPlan && (
            <Button
              type="button"
              size="sm"
              variant={subscriptionExpired ? "default" : "outline"}
              disabled={checkoutLoading}
              onClick={() => checkout({ plan: renewPlan })}
              className="gap-1.5 text-xs font-semibold"
            >
              {checkoutLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CreditCard className="w-3.5 h-3.5" />
              )}
              Renew {current.label} — {current.priceShort}/mo
            </Button>
          )}

          {nextPlan && (
            <Button
              type="button"
              size="sm"
              disabled={checkoutLoading}
              onClick={() => checkout({ plan: nextPlan })}
              className="gap-1.5 text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              {nextPlan === "PRO"
                ? "Upgrade to Pro — ₹199/mo"
                : "Upgrade to Pro+ — ₹499/mo"}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() =>
              openUpgradeModal({
                reason: subscriptionExpired
                  ? "Renew or change your plan to restore full access."
                  : anyExceeded
                    ? "Choose a higher plan for more headroom."
                    : "Compare plans and upgrade anytime.",
              })
            }
          >
            Compare all plans
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Each successful payment extends your subscription by 30 days. If you renew
          before expiry, the extra month is added to your current end date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Usage this period</h2>
        <UsageIndicator variant="detailed" />
        <p className="text-[11px] text-muted-foreground">
          Artifact limits count lifetime creations; deleting artifacts does not
          restore quota.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <h2 className="text-xs font-semibold text-foreground">Quick links</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/settings/integrations"
            className="text-primary hover:underline underline-offset-2"
          >
            Integrations
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            href="/settings/memory"
            className="text-primary hover:underline underline-offset-2"
          >
            Memory settings
          </Link>
        </div>
      </section>
    </div>
  );
}
