"use client";

import { useState } from "react";
import { AlertCircle, Check, Coins, Flame, Loader2, Sparkles, Upload, MessageSquare, BookOpen, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/lib/auth-client";
import { useRazorpayCheckout } from "../hooks/use-razorpay";
import { useUsage } from "../hooks/use-usage";
import {
  CREDIT_COSTS,
  CREDIT_PACKS,
  calculateCreditsForInr,
  formatInr,
} from "../lib/plans";

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
  const { credits } = useUsage();
  const { checkout, isLoading, error } = useRazorpayCheckout();

  const [selectedPackId, setSelectedPackId] = useState<string>("learner");
  const [customAmount, setCustomAmount] = useState<number>(100);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const isEmbedded = variant === "embedded";
  const isAuthenticated = !!session?.user;

  const currentPack = CREDIT_PACKS.find((p) => p.id === selectedPackId);
  const effectiveAmount = isCustom ? customAmount : (currentPack?.amountInr ?? 100);
  const effectiveCredits = isCustom
    ? calculateCreditsForInr(customAmount)
    : (currentPack?.credits ?? 220);

  const handleBuy = (amount: number) => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent("/pricing")}`;
      return;
    }

    checkout({
      amountInr: amount,
      onSuccess: onCheckoutSuccess,
    });
  };

  return (
    <div
      className={cn(
        "w-full",
        isEmbedded ? "space-y-6" : "mx-auto max-w-5xl space-y-10",
        className
      )}
    >
      {/* Optional Alert Message when user was redirected due to 0 credits */}
      {alertMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {showHeader && (
        <header className="text-center space-y-3 px-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>Pay-As-You-Go Credit Economy</span>
          </div>
          <h2
            className={cn(
              "font-serif text-foreground tracking-tight text-balance",
              isEmbedded
                ? "text-2xl sm:text-3xl"
                : "text-3xl sm:text-4xl md:text-5xl font-bold"
            )}
          >
            Simple, Honest, Transparent Pricing
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            No recurring monthly subscriptions. Buy credits when you need them.
            Credits never expire.
          </p>

          {isAuthenticated && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <span>Your Current Balance:</span>
              <strong className="text-sm">{credits.toLocaleString("en-IN")} Credits</strong>
            </div>
          )}
        </header>
      )}

      {/* Credit Cost Matrix Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border/70 bg-card/50 text-card-foreground text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-xs text-muted-foreground">Source Upload</div>
          <div className="text-base font-bold text-foreground">
            {CREDIT_COSTS.SOURCE_UPLOAD} <span className="text-xs font-normal text-muted-foreground">credits</span>
          </div>
          <div className="text-[11px] text-muted-foreground/80">PDF, Web, YouTube</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-card/50 text-card-foreground text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-xs text-muted-foreground">Chat Query</div>
          <div className="text-base font-bold text-foreground">
            {CREDIT_COSTS.CHAT_MESSAGE} <span className="text-xs font-normal text-muted-foreground">credit</span>
          </div>
          <div className="text-[11px] text-muted-foreground/80">RAG response + citation</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-card/50 text-card-foreground text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xs text-muted-foreground">Study Artifact</div>
          <div className="text-base font-bold text-foreground">
            {CREDIT_COSTS.ARTIFACT_GENERATE} <span className="text-xs font-normal text-muted-foreground">credits</span>
          </div>
          <div className="text-[11px] text-muted-foreground/80">Quiz, Flashcard, Mindmap</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-card/50 text-card-foreground text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="text-xs text-muted-foreground">Audio Debate</div>
          <div className="text-base font-bold text-foreground">
            {CREDIT_COSTS.AUDIO_DEBATE} <span className="text-xs font-normal text-muted-foreground">credits</span>
          </div>
          <div className="text-[11px] text-muted-foreground/80">Two-Host Voice Podcast</div>
        </div>
      </div>

      {/* Credit Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CREDIT_PACKS.map((pack) => {
          const isSelected = !isCustom && selectedPackId === pack.id;
          return (
            <div
              key={pack.id}
              onClick={() => {
                setIsCustom(false);
                setSelectedPackId(pack.id);
              }}
              className={cn(
                "relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border/80 bg-card hover:border-border hover:shadow-sm"
              )}
            >
              {pack.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Most Popular</span>
                </div>
              )}

              {pack.bonusPercent > 0 && !pack.isPopular && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  +{pack.bonusPercent}% Bonus
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground text-base">
                    {pack.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {formatInr(pack.amountInr)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-center">
                  <div className="text-2xl font-black text-primary">
                    {pack.credits.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Total Credits
                  </div>
                </div>

                <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>~{Math.floor(pack.credits / 5)} source uploads</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>~{pack.credits} chat messages</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>~{Math.floor(pack.credits / 10)} learning artifacts</span>
                  </li>
                  {pack.credits >= 50 && (
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>~{Math.floor(pack.credits / 50)} audio podcasts</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className="w-full"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuy(pack.amountInr);
                  }}
                >
                  {isLoading && isSelected ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Buy for ${formatInr(pack.amountInr)}`
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Amount Top-Up Card */}
      <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Custom Credit Top-up</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter any amount (minimum ₹50). Up to 30% automatic bonus for larger amounts.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                ₹
              </span>
              <input
                type="number"
                min={50}
                step={10}
                value={customAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomAmount(isNaN(val) ? 50 : Math.max(50, val));
                  setIsCustom(true);
                }}
                className="w-full pl-7 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <Button
              type="button"
              disabled={isLoading || customAmount < 50}
              onClick={() => handleBuy(customAmount)}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `Buy ${calculateCreditsForInr(customAmount).toLocaleString("en-IN")} Credits`
              )}
            </Button>
          </div>
        </div>

        {/* Quick Amount Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-xs">
          <span className="text-muted-foreground">Quick select:</span>
          {[50, 100, 150, 200, 300, 500, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setCustomAmount(amt);
                setIsCustom(true);
              }}
              className={cn(
                "px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                isCustom && customAmount === amt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-foreground border-border hover:bg-muted"
              )}
            >
              ₹{amt} ({calculateCreditsForInr(amt)} cr)
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Trust & Policy Guarantee */}
      <div className="pt-2 text-center text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-6">
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Credits Never Expire</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Zero Monthly Commitments</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Automatic Refunds on Failed Generations</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Secured via Razorpay (UPI, Cards, NetBanking)</span>
        </span>
      </div>
    </div>
  );
}
