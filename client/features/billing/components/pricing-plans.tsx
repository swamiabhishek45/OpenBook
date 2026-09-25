"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/lib/auth-client";
import { useRazorpayCheckout } from "../hooks/use-razorpay";
import { useUsage } from "../hooks/use-usage";
import {
  PRICING_PLANS,
  type BillingInterval,
  getPlanPriceDisplay,
} from "../lib/plans";

function DiamondBullet({ inverted }: { inverted?: boolean }) {
  return (
    <span
      className={cn(
        "mt-1.5 size-1.5 shrink-0 rotate-45",
        inverted ? "bg-background" : "bg-foreground",
      )}
      aria-hidden
    />
  );
}

export type PricingPlansProps = {
  variant?: "page" | "embedded";
  alertMessage?: string;
  showHeader?: boolean;
  className?: string;
  onCheckoutSuccess?: () => void;
};

export function PricingPlans({
  variant = "page",
  alertMessage,
  showHeader = true,
  className,
  onCheckoutSuccess,
}: PricingPlansProps) {
  const { data: session } = useSession();
  const { usage, plan: effectivePlan } = useUsage();
  const currentPlan = usage?.subscriptionPlan ?? effectivePlan;
  const { checkout, isLoading, error } = useRazorpayCheckout();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "PRO_PLUS">("PRO");

  const isEmbedded = variant === "embedded";
  const isAuthenticated = !!session?.user;

  const handlePaidPlan = (planId: "PRO" | "PRO_PLUS") => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent("/settings/billing")}`;
      return;
    }
    setSelectedPlan(planId);
    checkout({
      plan: planId,
      onSuccess: onCheckoutSuccess,
    });
  };

  return (
    <div
      className={cn(
        "w-full",
        isEmbedded ? "space-y-6" : "mx-auto max-w-5xl",
        className,
      )}
    >
      {showHeader && (
        <header className="text-center space-y-4 px-2">
          <p
            className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Pricing
          </p>
          <h2
            className={cn(
              "font-serif text-foreground tracking-tight text-balance",
              isEmbedded
                ? "text-2xl sm:text-3xl"
                : "text-3xl sm:text-4xl md:text-[2.75rem] leading-[1.12]",
            )}
          >
            Simple, flexible pricing for researchers
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Transparent plans that scale with you at every stage of your work.
          </p>

          <div
            className="inline-flex items-center rounded-full border border-border bg-muted/40 p-1"
            role="tablist"
            aria-label="Billing interval"
          >
            {(["monthly", "yearly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={interval === value}
                onClick={() => setInterval(value)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                  interval === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </header>
      )}

      {alertMessage && (
        <div
          className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive max-w-2xl mx-auto"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      <div
        className={cn(
          "grid gap-5 md:gap-6",
          isEmbedded
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 lg:grid-cols-3",
        )}
      >
        {PRICING_PLANS.map((plan) => {
          const isFeatured = plan.isPopular;
          const isCurrent =
            currentPlan === plan.id && !usage?.subscriptionExpired;
          const canRenew =
            currentPlan === plan.id && plan.id !== "FREE";
          const price = getPlanPriceDisplay(plan, interval);
          const inverted = isFeatured;

          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-[1.75rem] border p-6 sm:p-7 transition-shadow",
                isFeatured
                  ? "border-foreground bg-foreground text-background shadow-xl lg:-translate-y-1"
                  : "border-border bg-card text-card-foreground shadow-sm hover:shadow-md",
              )}
            >
              {isFeatured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground"
                >
                  Most popular
                </span>
              )}

              <div className="space-y-5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className={cn(
                        "font-serif text-2xl tracking-tight",
                        inverted ? "text-background" : "text-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-xs leading-relaxed max-w-[16rem]",
                        inverted ? "text-background/75" : "text-muted-foreground",
                      )}
                    >
                      {plan.description}
                    </p>
                  </div>
                  {isCurrent && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        inverted
                          ? "border-background/30 text-background"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      Current
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span
                      className={cn(
                        "text-4xl font-semibold tracking-tight tabular-nums",
                        inverted ? "text-background" : "text-foreground",
                      )}
                    >
                      {price.main}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        inverted ? "text-background/70" : "text-muted-foreground",
                      )}
                    >
                      {price.suffix}
                    </span>
                  </div>
                  {price.note && (
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        inverted ? "text-background/60" : "text-muted-foreground",
                      )}
                    >
                      {price.note}
                    </p>
                  )}
                </div>

                {plan.id === "FREE" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCurrent}
                    asChild={!isCurrent}
                    className={cn(
                      "w-full rounded-full h-10 text-xs font-semibold",
                      inverted
                        ? "border-background/30 bg-background text-foreground hover:bg-background/90"
                        : "bg-background shadow-sm",
                    )}
                  >
                    {isCurrent ? (
                      <span>Current plan</span>
                    ) : (
                      <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                        Start for free
                      </Link>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isLoading && selectedPlan === plan.id}
                    onClick={() => handlePaidPlan(plan.id as "PRO" | "PRO_PLUS")}
                    className={cn(
                      "w-full rounded-full h-10 text-xs font-semibold",
                      inverted
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-foreground text-background hover:opacity-90",
                    )}
                  >
                    {isLoading && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Processing…
                      </>
                    ) : canRenew ? (
                      `Renew (${plan.monthlyPriceInr}/mo)`
                    ) : isCurrent ? (
                      <>
                        <Check className="size-3.5" />
                        Active plan
                      </>
                    ) : (
                      `Start with ${plan.name}`
                    )}
                  </Button>
                )}

                <div className="pt-2">
                  <p
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-wide mb-3",
                      inverted ? "text-background/70" : "text-muted-foreground",
                    )}
                  >
                    What&apos;s included
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-xs leading-snug"
                      >
                        <DiamondBullet inverted={inverted} />
                        <span
                          className={
                            inverted ? "text-background/90" : "text-foreground/90"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive flex items-center gap-2 max-w-2xl mx-auto">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
