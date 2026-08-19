"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  Zap,
  AlertCircle,
  Loader2,
  Crown,
  Layers,
  FileText,
  MessageSquare,
  Sparkle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { useRazorpayCheckout } from "../hooks/use-razorpay";
import { useUsage } from "../hooks/use-usage";
import { PlanType } from "../types";
import { cn } from "@/lib/utils";

interface PlanConfig {
  id: PlanType;
  name: string;
  price: string;
  period?: string;
  description: string;
  isPopular?: boolean;
  features: {
    text: string;
    highlight?: boolean;
  }[];
}

const PLANS: PlanConfig[] = [
  {
    id: "FREE",
    name: "Free",
    price: "₹0",
    period: "/forever",
    description: "Get started with fundamental AI research & synthesis.",
    features: [
      { text: "1 Workspace" },
      { text: "10 Chat Messages" },
      { text: "3 Sources Upload" },
      { text: "3 Learning Artifacts" },
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹199",
    period: "/month",
    description: "For active learners and researchers needing more headroom.",
    isPopular: true,
    features: [
      { text: "3 Workspaces", highlight: true },
      { text: "Unlimited Chats", highlight: true },
      { text: "15 Sources Upload", highlight: true },
      { text: "10 Learning Artifacts", highlight: true },
    ],
  },
  {
    id: "PRO_PLUS",
    name: "Pro+",
    price: "₹499",
    period: "/month",
    description: "Powerhouse tier for heavy researchers and power creators.",
    features: [
      { text: "10 Workspaces", highlight: true },
      { text: "Unlimited Chats", highlight: true },
      { text: "30 Sources Upload", highlight: true },
      { text: "25 Learning Artifacts", highlight: true },
    ],
  },
];

export function UpgradeModal() {
  const { isOpen, reason, closeUpgradeModal } = useUpgradeModal();
  const { plan: currentPlan } = useUsage();
  const { checkout, isLoading, error } = useRazorpayCheckout();
  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "PRO_PLUS">("PRO");

  const handleUpgrade = (planToBuy: "PRO" | "PRO_PLUS") => {
    setSelectedPlan(planToBuy);
    checkout({
      plan: planToBuy,
      onSuccess: () => {
        closeUpgradeModal();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeUpgradeModal()}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card text-card-foreground border-border rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 text-center sm:text-center space-y-2.5">
          <div className="flex justify-center">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Subscription Plans</span>
            </Badge>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-sans">
            Choose the Perfect Plan for Your Research
          </DialogTitle>

          {reason ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 mx-auto max-w-xl text-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reason}</span>
            </div>
          ) : (
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Upgrade anytime to unlock higher source limits, more workspaces, and unlimited AI conversations.
            </DialogDescription>
          )}
        </DialogHeader>

        <Separator />

        {/* 3-Tier Pricing Cards Grid */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((planItem) => {
              const isCurrent = currentPlan === planItem.id;
              const isPopular = planItem.isPopular;

              return (
                <div
                  key={planItem.id}
                  className={cn(
                    "relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200",
                    isPopular
                      ? "bg-secondary/40 border-primary/60 shadow-lg ring-1 ring-primary/20 md:-translate-y-1"
                      : "bg-card border-border hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs hover:shadow-md"
                  )}
                >
                  {/* Most Popular Top Pill */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        variant="default"
                        className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider gap-1.5 shadow-sm rounded-full bg-primary text-primary-foreground"
                      >
                        <Crown className="w-3 h-3 fill-current" />
                        <span>Most Popular</span>
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Plan Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground font-sans">
                          {planItem.name}
                        </h3>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px] font-medium border-primary/40 text-foreground">
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 min-h-8 leading-relaxed">
                        {planItem.description}
                      </p>
                    </div>

                    {/* Price Display */}
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-sans tracking-tight">
                        {planItem.price}
                      </span>
                      {planItem.period && (
                        <span className="text-xs text-muted-foreground font-medium">
                          {planItem.period}
                        </span>
                      )}
                    </div>

                    <Separator />

                    {/* Features List */}
                    <ul className="space-y-2.5 text-xs py-1">
                      {planItem.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                              feat.highlight
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          </div>
                          <span
                            className={cn(
                              feat.highlight
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-auto">
                    {planItem.id === "FREE" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isCurrent}
                        className="w-full text-xs font-medium rounded-xl h-9 cursor-pointer"
                      >
                        {isCurrent ? "Active Plan" : "Free Tier"}
                      </Button>
                    ) : (
                      <Button
                        variant={isPopular ? "default" : "outline"}
                        size="sm"
                        disabled={isCurrent || (isLoading && selectedPlan === planItem.id)}
                        onClick={() => handleUpgrade(planItem.id as "PRO" | "PRO_PLUS")}
                        className={cn(
                          "w-full text-xs font-semibold gap-1.5 rounded-xl h-9 transition-all cursor-pointer",
                          isPopular ? "shadow-sm hover:opacity-90 active:scale-[0.98]" : "hover:bg-muted"
                        )}
                      >
                        {isLoading && selectedPlan === planItem.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : isCurrent ? (
                          <div className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active Plan</span>
                          </div>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Upgrade ({planItem.price}/mo)</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
