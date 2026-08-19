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

export function findPaymentRecordByOrderId(orderId: string) {
    return prisma.paymentRecord.findUnique({
        where: { razorpayOrderId: orderId },
    });
}

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

export function markPaymentRecordFailed(orderId: string) {
    return prisma.paymentRecord.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "FAILED" },
    });
}
