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
import {
    addCredits,
    calculateCreditsForInr,
    getUserCredits,
} from "./credit.services.js";
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
        name: "OpenBook Pro",
    },
    PRO_PLUS: {
        pricePaise: 49900, // ₹499 in paise
        label: "₹499 / month",
        name: "OpenBook Pro+",
    },
};

/**
 * Initializes and returns the Razorpay SDK instance along with configured API credentials.
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
 * Creates a Razorpay order for purchasing credits (or legacy plan upgrade).
 */
export async function createRazorpayOrder(
    userId: string,
    options?: {
        amountInr?: number;
        plan?: "PRO" | "PRO_PLUS";
    },
) {
    const user = await findUserPlanDetails(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const { razorpay, keyId } = getRazorpayInstance();

    let amountPaise: number;
    let creditsToAward = 0;
    let description = "";
    let targetPlan: PlanType = "PRO";

    if (options?.amountInr !== undefined && options.amountInr >= 50) {
        const amountInr = options.amountInr;
        creditsToAward = calculateCreditsForInr(amountInr);
        amountPaise = Math.round(amountInr * 100);
        description = `Purchase ${creditsToAward} OpenBook Credits`;
    } else if (options?.plan) {
        targetPlan = options.plan === "PRO_PLUS" ? "PRO_PLUS" : "PRO";
        const planConfig = PLAN_PRICES[targetPlan];
        amountPaise = planConfig.pricePaise;
        creditsToAward = targetPlan === "PRO_PLUS" ? 1500 : 500;
        description = planConfig.name;
    } else {
        // Default to min ₹50 -> 100 credits
        const amountInr = 50;
        creditsToAward = calculateCreditsForInr(amountInr);
        amountPaise = amountInr * 100;
        description = `Purchase ${creditsToAward} OpenBook Credits`;
    }

    const shortUserId = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
    const receipt = `rcpt_${Date.now()}_${shortUserId}`;

    try {
        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: "INR",
            receipt,
            notes: {
                userId,
                userEmail: user.email,
                creditsPurchased: String(creditsToAward),
                plan: targetPlan,
            },
        });

        // Store pending payment in database
        await createPaymentRecord({
            userId,
            plan: targetPlan,
            creditsPurchased: creditsToAward,
            razorpayOrderId: order.id,
            amount:
                typeof order.amount === "number" ? order.amount : amountPaise,
            currency: order.currency || "INR",
            status: "PENDING",
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            credits: creditsToAward,
            plan: targetPlan,
            planName: description,
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
 * Validates the HMAC SHA256 signature and credits the user's account.
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

    // Find the pending payment record
    const paymentRecord = await findPaymentRecordByOrderId(razorpay_order_id);

    // Update payment record to SUCCESS
    await updatePaymentRecordSuccess({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
    });

    const creditsPurchased = paymentRecord?.creditsPurchased ?? (input.amountInr ? calculateCreditsForInr(input.amountInr) : 100);

    // Add credits to user's balance
    let newBalance = await getUserCredits(userId);
    if (creditsPurchased > 0) {
        newBalance = await addCredits(
            userId,
            creditsPurchased,
            "PURCHASE",
            `Purchased ${creditsPurchased} credits via Razorpay (Order ${razorpay_order_id})`,
            { orderId: razorpay_order_id, paymentId: razorpay_payment_id }
        );
    }

    // Legacy plan renewal for backwards compatibility
    if (paymentRecord?.plan) {
        await renewOrUpgradeUserPlan(userId, paymentRecord.plan).catch(() => {});
    }

    return {
        success: true,
        credits: newBalance,
        creditsAdded: creditsPurchased,
        message: `Payment successful! Added ${creditsPurchased} credits to your account.`,
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
 * Verifies Razorpay webhook signature and idempotently applies credits.
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

    if (record.creditsPurchased > 0) {
        await addCredits(
            record.userId,
            record.creditsPurchased,
            "PURCHASE",
            `Webhook: Added ${record.creditsPurchased} credits (Payment ${payment.id})`,
            { orderId: payment.order_id, paymentId: payment.id }
        );
    }

    if (record.plan) {
        await renewOrUpgradeUserPlan(record.userId, record.plan).catch(() => {});
    }

    logger.info("Razorpay webhook processed payment", {
        userId: record.userId,
        credits: record.creditsPurchased,
        paymentId: payment.id,
    });

    return { handled: true, duplicate: false as const };
}
