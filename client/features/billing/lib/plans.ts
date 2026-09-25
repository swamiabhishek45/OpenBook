import type { PlanType } from "../types";

export type BillingInterval = "monthly" | "yearly";

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
    description: "Get started with grounded research and study tools.",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    features: [
      "1 workspace",
      "10 chat messages",
      "3 source uploads",
      "3 learning artifacts",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    description: "For active learners who need more room to grow.",
    isPopular: true,
    monthlyPriceInr: 199,
    yearlyPriceInr: 1990,
    features: [
      "3 workspaces",
      "Unlimited chats",
      "15 source uploads",
      "10 learning artifacts",
    ],
  },
  {
    id: "PRO_PLUS",
    name: "Pro+",
    description: "For power researchers and heavy creators.",
    monthlyPriceInr: 499,
    yearlyPriceInr: 4990,
    features: [
      "10 workspaces",
      "Unlimited chats",
      "30 source uploads",
      "25 learning artifacts",
    ],
  },
];

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export type PlanPriceDisplay = {
  main: string;
  suffix: string;
  note?: string;
};

export function getPlanPriceDisplay(
  plan: PricingPlanConfig,
  interval: BillingInterval,
): PlanPriceDisplay {
  if (plan.id === "FREE") {
    return { main: formatInr(0), suffix: "/ forever" };
  }

  if (interval === "yearly") {
    const perMonth = Math.round(plan.yearlyPriceInr / 12);
    return {
      main: formatInr(perMonth),
      suffix: "/ month, billed yearly",
      note: `${formatInr(plan.yearlyPriceInr)} per year`,
    };
  }

  return {
    main: formatInr(plan.monthlyPriceInr),
    suffix: "/ month",
  };
}
