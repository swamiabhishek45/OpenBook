import prisma from "../lib/db.js";
import type { PaymentStatus, PlanType } from "../generated/prisma/client.js";

export interface CreatePaymentRecordData {
    userId: string;
    plan: PlanType;
    razorpayOrderId: string;
    amount: number;
    currency?: string;
    status?: PaymentStatus;
}

/**
 * Inserts a new Razorpay payment record into PostgreSQL (status: PENDING by default).
 *
 * @param data - Payment record attributes
 * @returns Promise resolving to created PaymentRecord
 */
export function createPaymentRecord(data: CreatePaymentRecordData) {
    return prisma.paymentRecord.create({
        data: {
            userId: data.userId,
            plan: data.plan,
            razorpayOrderId: data.razorpayOrderId,
            amount: data.amount,
            currency: data.currency || "INR",
            status: data.status || "PENDING",
        },
    });
}

/**
 * Queries a payment record by its unique Razorpay order ID.
 *
 * @param orderId - Razorpay order identifier
 * @returns Promise resolving to matching PaymentRecord or null
 */
export function findPaymentRecordByOrderId(orderId: string) {
    return prisma.paymentRecord.findUnique({
        where: { razorpayOrderId: orderId },
    });
}

/**
 * Updates a payment record status to SUCCESS upon valid signature verification.
 *
 * @param params - Object containing orderId, paymentId, and signature
 * @returns Promise resolving to update batch payload
 */
export function updatePaymentRecordSuccess({
    orderId,
    paymentId,
    signature,
}: {
    orderId: string;
    paymentId: string;
    signature: string;
}) {
    return prisma.paymentRecord.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
            status: "SUCCESS",
        },
    });
}

/**
 * Marks a payment record as FAILED when signature verification or checkout fails.
 *
 * @param orderId - Razorpay order identifier
 * @returns Promise resolving to update batch payload
 */
export function markPaymentRecordFailed(orderId: string) {
    return prisma.paymentRecord.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "FAILED" },
    });
}
