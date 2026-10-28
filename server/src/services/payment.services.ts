import crypto from "crypto";
import Razorpay from "razorpay";
import {
    createPaymentRecord,
    findPaymentRecordByOrderId,
    findPaymentRecordByPaymentId,
    markPaymentRecordFailed,
    updatePaymentRecordSuccess,
} from "../repository/payment.repository.js";
import { logger } from "../lib/logger.js";
import {
    findUserPlanDetails,
    renewOrUpgradeUserPlan,
} from "../repository/user.repository.js";
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

/**
 * Initializes and returns the Razorpay SDK instance along with configured API credentials.
 *
 * @returns Object containing Razorpay client, keyId, and keySecret
 * @throws {AppError} If RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables
 */
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

/**
 * Creates a Razorpay order for upgrading a user to PRO or PRO_PLUS and saves a pending payment record.
 *
 * @param userId - Unique identifier of the user
 * @param requestedPlan - Target subscription tier ("PRO" or "PRO_PLUS")
 * @returns Order details including orderId, amount, currency, plan info, and user contact details
 * @throws {AppError} When user is not found or order creation with Razorpay fails
 */
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

/**
 * Validates the HMAC SHA256 signature of a completed Razorpay payment and upgrades the user's plan.
 *
 * @param userId - Unique identifier of the user
 * @param input - Razorpay payment verification parameters (orderId, paymentId, signature)
 * @returns Success response with updated plan details
 * @throws {ValidationError} When payment signature is invalid or required parameters are missing
 */
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

    const userBefore = await findUserPlanDetails(userId);

    // Update payment record to SUCCESS
    await updatePaymentRecordSuccess({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
    });

    // Upgrade user to the purchased plan
    const updatedUser = await renewOrUpgradeUserPlan(userId, targetPlan);

    const planDisplayName =
        targetPlan === "PRO_PLUS" ? "ChaiBookLM Pro+" : "ChaiBookLM Pro";

    const renewedSamePlan =
        userBefore?.plan === targetPlan && targetPlan !== "FREE";

    return {
        success: true,
        plan: updatedUser.plan,
        planExpiresAt: updatedUser.planExpiresAt,
        message: renewedSamePlan
            ? `Your ${planDisplayName} subscription is renewed through ${updatedUser.planExpiresAt?.toISOString().slice(0, 10)}.`
            : `Congratulations! You have successfully upgraded to ${planDisplayName}.`,
    };
}

type RazorpayWebhookPayload = {
    event?: string;
    payload?: {
        payment?: {
            entity?: {
                id?: string;
                order_id?: string;
                status?: string;
            };
        };
    };
};

/**
 * Verifies Razorpay webhook signature and idempotently marks successful payments.
 */
export async function processRazorpayWebhook(
    rawBody: Buffer,
    signatureHeader: string | undefined,
) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new AppError(
            503,
            "RAZORPAY_WEBHOOK_SECRET is not configured on the server",
        );
    }

    if (!signatureHeader) {
        throw new ValidationError("Missing Razorpay webhook signature");
    }

    const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

    if (expected !== signatureHeader) {
        throw new ValidationError("Invalid Razorpay webhook signature");
    }

    const body = JSON.parse(rawBody.toString("utf8")) as RazorpayWebhookPayload;
    const event = body.event ?? "";
    const payment = body.payload?.payment?.entity;

    if (event !== "payment.captured" || !payment?.id || !payment.order_id) {
        return { handled: false, reason: "ignored_event" as const };
    }

    const existing = await findPaymentRecordByPaymentId(payment.id);
    if (existing?.status === "SUCCESS") {
        logger.info("Razorpay webhook duplicate ignored", {
            paymentId: payment.id,
        });
        return { handled: true, duplicate: true as const };
    }

    const record = await findPaymentRecordByOrderId(payment.order_id);
    if (!record) {
        logger.warn("Razorpay webhook for unknown order", {
            orderId: payment.order_id,
        });
        return { handled: false, reason: "unknown_order" as const };
    }

    await updatePaymentRecordSuccess({
        orderId: payment.order_id,
        paymentId: payment.id,
        signature: signatureHeader,
    });

    await renewOrUpgradeUserPlan(record.userId, record.plan);

    logger.info("Razorpay webhook applied plan upgrade", {
        userId: record.userId,
        plan: record.plan,
        paymentId: payment.id,
    });

    return { handled: true, duplicate: false as const };
}
