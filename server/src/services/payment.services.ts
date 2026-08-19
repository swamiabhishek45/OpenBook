import crypto from "crypto";
import Razorpay from "razorpay";
import {
    createPaymentRecord,
    findPaymentRecordByOrderId,
    markPaymentRecordFailed,
    updatePaymentRecordSuccess,
} from "../repository/payment.repository.js";
import { findUserPlanDetails, updateUserPlan } from "../repository/user.repository.js";
import { AppError, ValidationError } from "../types/app-error.js";
import type { PlanType } from "../generated/prisma/client.js";
import type { VerifyPaymentInput } from "../validators/payment.validator.js";

export const PLAN_PRICES: Record<
    "PRO" | "PRO_PLUS",
    { pricePaise: number; label: string; name: string }
> = {
    PRO: {
        pricePaise: 19900, // ₹199 in paise
        label: "₹199 / month",
        name: "ChaiBookLM Pro",
    },
    PRO_PLUS: {
        pricePaise: 49900, // ₹499 in paise
        label: "₹499 / month",
        name: "ChaiBookLM Pro+",
    },
};

function getRazorpayInstance() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new AppError(
            500,
            "Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env",
        );
    }

    return {
        razorpay: new Razorpay({ key_id, key_secret }),
        keyId: key_id,
        keySecret: key_secret,
    };
}

export async function createRazorpayOrder(
    userId: string,
    requestedPlan: "PRO" | "PRO_PLUS" = "PRO",
) {
    const user = await findUserPlanDetails(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const plan: "PRO" | "PRO_PLUS" =
        requestedPlan === "PRO_PLUS" ? "PRO_PLUS" : "PRO";
    const planConfig = PLAN_PRICES[plan];

    const { razorpay, keyId } = getRazorpayInstance();

    const shortUserId = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
    const receipt = `rcpt_${Date.now()}_${shortUserId}`;

    try {
        const order = await razorpay.orders.create({
            amount: planConfig.pricePaise,
            currency: "INR",
            receipt,
            notes: {
                userId,
                userEmail: user.email,
                plan,
            },
        });

        // Store pending payment in database
        await createPaymentRecord({
            userId,
            plan,
            razorpayOrderId: order.id,
            amount:
                typeof order.amount === "number"
                    ? order.amount
                    : planConfig.pricePaise,
            currency: order.currency || "INR",
            status: "PENDING",
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan,
            planName: planConfig.name,
            keyId,
            user: {
                name: user.name,
                email: user.email,
            },
        };
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        throw new AppError(
            500,
            error instanceof Error
                ? `Failed to create payment order: ${error.message}`
                : "Failed to create payment order with Razorpay",
        );
    }
}

export async function verifyRazorpayPayment(
    userId: string,
    input: VerifyPaymentInput,
) {
    const { keySecret } = getRazorpayInstance();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        input;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ValidationError("Missing required Razorpay payment fields");
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        // Mark payment as FAILED if recorded
        await markPaymentRecordFailed(razorpay_order_id).catch(() => {});

        throw new ValidationError(
            "Invalid payment signature verification failed",
        );
    }

    // Find the pending payment record to get the plan purchased
    const paymentRecord = await findPaymentRecordByOrderId(razorpay_order_id);

    const targetPlan: PlanType =
        paymentRecord?.plan ?? input.plan ?? "PRO";

    // Update payment record to SUCCESS
    await updatePaymentRecordSuccess({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
    });

    // Upgrade user to the purchased plan
    const updatedUser = await updateUserPlan(userId, targetPlan);

    const planDisplayName =
        targetPlan === "PRO_PLUS" ? "ChaiBookLM Pro+" : "ChaiBookLM Pro";

    return {
        success: true,
        plan: updatedUser.plan,
        message: `Congratulations! You have successfully upgraded to ${planDisplayName}.`,
    };
}
