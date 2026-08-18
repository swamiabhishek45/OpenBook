import type { Request, Response } from "express";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../services/payment.services.js";

export async function createOrder(req: Request, res: Response) {
    const plan = req.body?.plan === "PRO_PLUS" ? "PRO_PLUS" : "PRO";
    const orderData = await createRazorpayOrder(req.session.user.id, plan);
    res.status(201).json(orderData);
}

export async function verifyPayment(req: Request, res: Response) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
        req.body;

    const result = await verifyRazorpayPayment(req.session.user.id, {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
    });

    res.json(result);
}

