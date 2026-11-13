import type { CreditPack, PlanType } from "../types";

export type BillingInterval = "monthly" | "yearly";

export const CREDIT_COSTS = {
  SOURCE_UPLOAD: 5,
  CHAT_MESSAGE: 1,
  ARTIFACT_GENERATE: 10,
  AUDIO_DEBATE: 50,
} as const;

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter Pack",
    amountInr: 50,
    credits: 100,
    bonusPercent: 0,
  },
  {
    id: "learner",
    name: "Learner Pack",
    amountInr: 100,
    credits: 220,
    bonusPercent: 10,
    isPopular: true,
  },
  {
    id: "researcher",
    name: "Researcher Pack",
    amountInr: 250,
    credits: 600,
    bonusPercent: 20,
  },
  {
    id: "power",
    name: "Power Pack",
    amountInr: 500,
    credits: 1300,
    bonusPercent: 30,
  },
];

export function calculateCreditsForInr(amountInr: number): number {
  if (amountInr < 50) return 0;
  const matched = CREDIT_PACKS.find((p) => p.amountInr === amountInr);
  if (matched) return matched.credits;

  const base = amountInr * 2;
  let bonus = 1;
  if (amountInr >= 500) bonus = 1.3;
  else if (amountInr >= 250) bonus = 1.2;
  else if (amountInr >= 100) bonus = 1.1;

  return Math.round(base * bonus);
}

export type PricingPlanConfig = {
  id: PlanType;
  name: string;
  description: string;
  isPopular?: boolean;
  monthlyPriceInr: number;
  yearlyPriceInr: number;
  features: string[];
};

export const PRICING_PLANS: PricingPlanConfig[] = [
  {
    id: "FREE",
    name: "Free",
    description: "50 Free Welcome Credits to explore OpenBook.",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    features: [
      "50 Starter credits included",
      "5 credits per source upload",
      "1 credit per chat prompt",
      "10 credits per study artifact",
    ],
  },
  {
    id: "PRO",
    name: "Top-Up Credits",
    description: "Pay only for what you use. Credits never expire.",
    isPopular: true,
    monthlyPriceInr: 100,
    yearlyPriceInr: 1000,
    features: [
      "Minimum purchase: ₹50 for 100 credits",
      "Up to 30% bonus on higher packs",
      "Audio Debate Podcasts (50 credits)",
      "Zero recurring monthly fees",
    ],
  },
  {
    id: "PRO_PLUS",
    name: "Power User",
    description: "For active researchers and heavy synthesis.",
    monthlyPriceInr: 500,
    yearlyPriceInr: 5000,
    features: [
      "1,300 credits for ₹500 (30% bonus)",
      "Unlimited workspaces",
      "Full priority RAG processing",
      "Dedicated high-speed audio debate queue",
    ],
  },
];

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
