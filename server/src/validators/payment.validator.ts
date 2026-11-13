import { z } from "zod";

export const createOrderSchema = z.object({
  amountInr: z.number().min(50, "Minimum top-up amount is ₹50").optional(),
  plan: z.enum(["PRO", "PRO_PLUS"]).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
  amountInr: z.number().optional(),
  plan: z.enum(["PRO", "PRO_PLUS"]).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
