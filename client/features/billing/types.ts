export interface UsageMetric {
  count: number;
  limit: number | null;
  exceeded: boolean;
}

export type PlanType = "FREE" | "PRO" | "PRO_PLUS";

export interface UserUsage {
  plan: PlanType;
  isPro: boolean;
  isProPlus?: boolean;
  planExpiresAt: string | null;
  workspaces: UsageMetric;
  sources: UsageMetric;
  artifacts: UsageMetric;
  messages: UsageMetric;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  plan: "PRO" | "PRO_PLUS";
  planName?: string;
  keyId: string;
  user: {
    name: string;
    email: string;
  };
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}
