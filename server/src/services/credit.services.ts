import prisma from "../lib/db.js";
import { InsufficientCreditsError } from "../types/app-error.js";
import type { CreditTransactionType } from "../generated/prisma/client.js";

export const CREDIT_COSTS = {
  SOURCE_UPLOAD: 5,
  CHAT_MESSAGE: 1,
  ARTIFACT_GENERATE: 10,
  AUDIO_DEBATE: 50,
} as const;

export const CREDIT_PACKS = [
  { id: "starter", name: "Starter Pack", amountInr: 50, credits: 100, bonusPercent: 0 },
  { id: "learner", name: "Learner Pack", amountInr: 100, credits: 220, bonusPercent: 10, isPopular: true },
  { id: "researcher", name: "Researcher Pack", amountInr: 250, credits: 600, bonusPercent: 20 },
  { id: "power", name: "Power Pack", amountInr: 500, credits: 1300, bonusPercent: 30 },
] as const;

/**
 * Calculates credit award for any INR amount (minimum ₹50).
 */
export function calculateCreditsForInr(amountInr: number): number {
  if (amountInr < 50) {
    throw new Error("Minimum top-up amount is ₹50.");
  }

  // Check matching predefined pack
  const matchedPack = CREDIT_PACKS.find((p) => p.amountInr === amountInr);
  if (matchedPack) {
    return matchedPack.credits;
  }

  // Tiered calculation for custom amounts
  const baseCredits = amountInr * 2;
  let bonusMultiplier = 1;
  if (amountInr >= 500) {
    bonusMultiplier = 1.3;
  } else if (amountInr >= 250) {
    bonusMultiplier = 1.2;
  } else if (amountInr >= 100) {
    bonusMultiplier = 1.1;
  }

  return Math.round(baseCredits * bonusMultiplier);
}

/**
 * Returns user's current credit balance.
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

/**
 * Throws InsufficientCreditsError if user has fewer credits than required.
 */
export async function assertHasCredits(userId: string, required: number): Promise<number> {
  const balance = await getUserCredits(userId);
  if (balance < required) {
    throw new InsufficientCreditsError(
      `Insufficient credits. This action requires ${required} credits, but your current balance is ${balance}.`,
      { required, balance, deficit: required - balance }
    );
  }
  return balance;
}

/**
 * Atomically deducts credits from a user's account and logs the transaction.
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  description: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; balance: number }> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    const currentBalance = user?.credits ?? 0;
    if (currentBalance < amount) {
      throw new InsufficientCreditsError(
        `Insufficient credits. Required: ${amount}, Available: ${currentBalance}.`,
        { required: amount, balance: currentBalance, deficit: amount - currentBalance }
      );
    }

    const newBalance = currentBalance - amount;

    await tx.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        balanceAfter: newBalance,
        type,
        description,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });

    return { success: true, balance: newBalance };
  });
}

/**
 * Atomically adds credits to a user's account (e.g. from a purchase or bonus) and logs the transaction.
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  description: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    const currentBalance = user?.credits ?? 0;
    const newBalance = currentBalance + amount;

    await tx.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        balanceAfter: newBalance,
        type,
        description,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });

    return newBalance;
  });
}

/**
 * Refunds credits for a failed operation.
 */
export async function refundCredits(
  userId: string,
  amount: number,
  originalType: CreditTransactionType,
  reason: string
): Promise<void> {
  await addCredits(
    userId,
    amount,
    "REFUND",
    `Refund for ${originalType}: ${reason}`,
    { originalType, reason }
  );
}

/**
 * Returns the credit transaction history for a user.
 */
export async function getCreditHistory(userId: string, limit = 50) {
  return prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

