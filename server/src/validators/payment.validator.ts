import { z } from "zod";

export const createOrderSchema = z.object({
    plan: z.enum(["PRO", "PRO_PLUS"]).default("PRO"),
});

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1, "Order ID is required"),
    razorpay_payment_id: z.string().min(1, "Payment ID is required"),
    razorpay_signature: z.string().min(1, "Signature is required"),
    plan: z.enum(["PRO", "PRO_PLUS"]).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
