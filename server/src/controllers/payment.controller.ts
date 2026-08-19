import type { Request, Response } from "express";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../services/payment.services.js";
import {
    createOrderSchema,
    verifyPaymentSchema,
} from "../validators/payment.validator.js";

export async function createOrder(req: Request, res: Response) {
    const { plan } = createOrderSchema.parse(req.body);
    const orderData = await createRazorpayOrder(req.session.user.id, plan);
    res.status(201).json(orderData);
}

export async function verifyPayment(req: Request, res: Response) {
    const input = verifyPaymentSchema.parse(req.body);
    const result = await verifyRazorpayPayment(req.session.user.id, input);
    res.json(result);
}
