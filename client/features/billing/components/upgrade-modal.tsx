"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Layers,
  FileText,
  MessageSquare,
  Compass,
  ArrowRight,
  CreditCard,
  AlertCircle,
  Loader2,
  Crown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { useRazorpayCheckout } from "../hooks/use-razorpay";
import { useUsage } from "../hooks/use-usage";
import { PlanType } from "../types";

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
    description: "Get started with fundamental AI knowledge tools.",
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
  const { plan: currentPlan, isProPlus } = useUsage();
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
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card text-card-foreground border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-3 text-center sm:text-center space-y-2">
          <div className="flex justify-center">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Subscription Plans</span>
            </Badge>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-sans">
            Choose the Perfect Plan for Your Research
          </DialogTitle>

          {reason ? (
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 mx-auto max-w-lg">
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
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {PLANS.map((planItem) => {
              const isCurrent = currentPlan === planItem.id;
              const isPopular = planItem.isPopular;

              return (
                <div
                  key={planItem.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                    isPopular
                      ? "bg-secondary/40 border-primary shadow-md ring-1 ring-primary/20"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  {/* Most Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        variant="default"
                        className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider gap-1 shadow-sm"
                      >
                        <Crown className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
                        <span>Most Popular</span>
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Plan Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-foreground font-sans">
                          {planItem.name}
                        </h3>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px]">
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                        {planItem.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground font-sans">
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
                    <ul className="space-y-2 text-xs">
                      {planItem.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div
                            className={`p-0.5 rounded-full ${
                              feat.highlight
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                          <span
                            className={
                              feat.highlight
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-5 mt-auto">
                    {planItem.id === "FREE" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isCurrent}
                        className="w-full text-xs"
                      >
                        {isCurrent ? "Active Plan" : "Free Tier"}
                      </Button>
                    ) : (
                      <Button
                        variant={isPopular ? "default" : "outline"}
                        size="sm"
                        disabled={isCurrent || (isLoading && selectedPlan === planItem.id)}
                        onClick={() => handleUpgrade(planItem.id as "PRO" | "PRO_PLUS")}
                        className={`w-full text-xs font-semibold gap-1.5 ${
                          isPopular ? "shadow-xs" : ""
                        }`}
                      >
                        {isLoading && selectedPlan === planItem.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : isCurrent ? (
                          "Active Plan"
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

        <Separator />

        {/* Footer */}
        <DialogFooter className="p-4 bg-muted/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Secured by <strong>Razorpay</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={closeUpgradeModal}
            className="text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
