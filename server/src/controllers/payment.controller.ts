import type { Request, Response } from "express";
import {
    createRazorpayOrder,
    processRazorpayWebhook,
    verifyRazorpayPayment,
} from "../services/payment.services.js";
import {
    createOrderSchema,
    verifyPaymentSchema,
} from "../validators/payment.validator.js";

/**
 * Handles HTTP POST request to initiate a Razorpay checkout order for plan upgrades (PRO / PRO_PLUS).
 *
 * @param req - Express request with selected plan in body
 * @param res - Express response returning 201 Created with order ID and details
 */
export async function createOrder(req: Request, res: Response) {
    const { plan } = createOrderSchema.parse(req.body);
    const orderData = await createRazorpayOrder(req.session.user.id, plan);
    res.status(201).json(orderData);
}

/**
 * Handles HTTP POST request to verify the cryptographic HMAC signature of a Razorpay payment and upgrade user.
 *
 * @param req - Express request with razorpay_order_id, razorpay_payment_id, and razorpay_signature
 * @param res - Express response returning upgrade success confirmation
 */
export async function verifyPayment(req: Request, res: Response) {
    const input = verifyPaymentSchema.parse(req.body);
    const result = await verifyRazorpayPayment(req.session.user.id, input);
    res.json(result);
}

/**
 * Razorpay server webhook (raw JSON body, no session). Idempotent on payment id.
 */
export async function handleRazorpayWebhook(req: Request, res: Response) {
    const rawBody = req.body as Buffer;
    if (!Buffer.isBuffer(rawBody)) {
        res.status(400).json({ error: "Expected raw JSON body" });
        return;
    }

    const signature =
        req.headers["x-razorpay-signature"]?.toString() ??
        req.headers["X-Razorpay-Signature"]?.toString();

    const result = await processRazorpayWebhook(rawBody, signature);
    res.json({ received: true, ...result });
}
