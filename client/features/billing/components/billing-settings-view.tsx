"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Coins,
  History,
  Plus,
  Sparkles,
  Upload,
  MessageSquare,
  BookOpen,
  Headphones,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";
import { useUsage } from "../hooks/use-usage";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { CREDIT_COSTS, formatInr } from "../lib/plans";
import { PricingPlans } from "./pricing-plans";

type BillingSettingsViewProps = {
  workspaceId?: string;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function BillingSettingsView({
  workspaceId,
}: BillingSettingsViewProps = {}) {
  const { credits, creditHistory, isLoading, isError } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

  const backHref = workspaceId ? `/workspace/${workspaceId}` : "/dashboard";

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ThemeLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          Failed to load credit details. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-lg font-semibold tracking-tight">Credits & Billing</h1>
      </div>

      {/* Credit Balance Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs bg-muted/50">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Available Balance</span>
              </Badge>
              <span className="text-xs text-muted-foreground">Pay-As-You-Go</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold tracking-tight text-foreground">
                {credits.toLocaleString("en-IN")}
              </span>
              <span className="text-base text-muted-foreground font-medium">Credits</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Credits never expire. Top up anytime starting from ₹50 for 100 credits.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => openUpgradeModal({ reason: "Top up your OpenBook credits", currentCredits: credits })}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              <span>Top Up Credits (Min ₹50)</span>
            </Button>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: "outline" }), "text-sm")}
            >
              View Credit Packs & Pricing
            </Link>
          </div>
        </div>

        {/* Action Cost Reference */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between space-y-4">
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Credit Rates</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Source Upload</span>
              </div>
              <strong className="text-foreground">{CREDIT_COSTS.SOURCE_UPLOAD} credits</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Chat Message</span>
              </div>
              <strong className="text-foreground">{CREDIT_COSTS.CHAT_MESSAGE} credit</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>Study Artifact</span>
              </div>
              <strong className="text-foreground">{CREDIT_COSTS.ARTIFACT_GENERATE} credits</strong>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Headphones className="w-3.5 h-3.5 text-rose-500" />
                <span>Audio Debate</span>
              </div>
              <strong className="text-foreground">{CREDIT_COSTS.AUDIO_DEBATE} credits</strong>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-muted-foreground/80">
            Failed generations are automatically refunded in full.
          </div>
        </div>
      </div>

      {/* Credit Packs Section */}
      <div className="pt-2">
        <PricingPlans
          variant="page"
          showHeader={false}
          className="space-y-6"
        />
      </div>

      {/* Credit Transaction History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span>Credit Transaction History</span>
          </h2>
          <span className="text-xs text-muted-foreground">Last 50 transactions</span>
        </div>

        {creditHistory.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
            No credit transactions recorded yet. Welcome credits were added upon registration.
          </div>
        ) : (
          <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {creditHistory.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px]",
                              isCredit
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-foreground"
                            )}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                            )}
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-foreground max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">
                          <span className={isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}>
                            {isCredit ? `+${tx.amount}` : tx.amount}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground font-mono">
                          {tx.balanceAfter}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
