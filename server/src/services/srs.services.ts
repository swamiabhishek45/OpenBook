import prisma from "../lib/db.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";
import {
    findArtifactByIdAndWorkspaceId,
    updateArtifactRecord,
} from "../repository/artifact.repository.js";
import { NotFoundError, ValidationError } from "../types/app-error.js";
import type { Prisma } from "../generated/prisma/client.js";

export interface SM2Input {
    currentRepetitions?: number;
    currentInterval?: number;
    currentEaseFactor?: number;
    rating: 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
}

export interface SM2Result {
    repetitions: number;
    interval: number; // in days
    easeFactor: number;
    dueDate: string;
    state: "NEW" | "LEARNING" | "REVIEW" | "MASTERED";
}

/**
 * Pure SuperMemo-2 (SM-2) interval and ease factor calculator.
 */
export function calculateSM2NextSchedule({
    currentRepetitions = 0,
    currentInterval = 0,
    currentEaseFactor = 2.5,
    rating,
}: SM2Input): SM2Result {
    let repetitions = currentRepetitions;
    let interval = currentInterval;
    let easeFactor = currentEaseFactor;
    let state: "NEW" | "LEARNING" | "REVIEW" | "MASTERED" = "REVIEW";

    // 1: Again (Forgot / Incorrect)
    if (rating === 1) {
        repetitions = 0;
        interval = 0; // Due immediately / same day (1 min in live review queue)
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        state = "LEARNING";
    }
    // 2: Hard (Struggled to recall)
    else if (rating === 2) {
        if (repetitions === 0) {
            interval = 1;
        } else {
            interval = Math.max(1, Math.round(interval * 1.2));
        }
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        repetitions += 1;
        state = "REVIEW";
    }
    // 3: Good (Standard recall)
    else if (rating === 3) {
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 3;
        } else {
            interval = Math.max(1, Math.round(interval * easeFactor));
        }
        repetitions += 1;
        state = interval >= 21 ? "MASTERED" : "REVIEW";
    }
    // 4: Easy (Effortless recall)
    else if (rating === 4) {
        if (repetitions === 0) {
            interval = 4;
        } else if (repetitions === 1) {
            interval = 7;
        } else {
            interval = Math.max(1, Math.round(interval * easeFactor * 1.3));
        }
        easeFactor += 0.15;
        repetitions += 1;
        state = interval >= 14 ? "MASTERED" : "REVIEW";
    }

    const dueTime =
        interval === 0
            ? Date.now() + 60 * 1000 // 1 minute from now
            : Date.now() + interval * 24 * 60 * 60 * 1000;

    return {
        repetitions,
        interval,
        easeFactor: Math.round(easeFactor * 100) / 100,
        dueDate: new Date(dueTime).toISOString(),
        state,
    };
}

export interface ReviewFlashcardInput {
    workspaceId: string;
    artifactId: string;
    userId: string;
    cardIndex: number;
    rating: 1 | 2 | 3 | 4;
}

/**
 * Updates a specific card's SM-2 review progress in DB and records user study activity.
 */
export async function reviewFlashcard({
    workspaceId,
    artifactId,
    userId,
    cardIndex,
    rating,
}: ReviewFlashcardInput) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const artifact = await findArtifactByIdAndWorkspaceId(
        artifactId,
        workspaceId,
    );
    if (!artifact) {
        throw new NotFoundError("Artifact not found.");
    }
    if (artifact.type !== "FLASHCARDS") {
        throw new ValidationError("Artifact is not a flashcard deck.");
    }

    const content = (artifact.content as Record<string, unknown>) || {};
    const cards = (content.cards as Array<Record<string, unknown>>) || [];

    if (cardIndex < 0 || cardIndex >= cards.length) {
        throw new ValidationError("Invalid flashcard index.");
    }

    const card = cards[cardIndex];
    const sm2Result = calculateSM2NextSchedule({
        currentRepetitions: (card.repetitions as number) || 0,
        currentInterval: (card.interval as number) || 0,
        currentEaseFactor: (card.easeFactor as number) || 2.5,
        rating,
    });

    const nowIso = new Date().toISOString();
    const updatedCard = {
        ...card,
        repetitions: sm2Result.repetitions,
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        dueDate: sm2Result.dueDate,
        state: sm2Result.state,
        lastReviewedAt: nowIso,
    };

    cards[cardIndex] = updatedCard;

    const metadata = (artifact.metadata as Record<string, unknown>) || {};
    const updatedMetadata = {
        ...metadata,
        lastStudiedAt: nowIso,
        totalReviewsCount: ((metadata.totalReviewsCount as number) || 0) + 1,
    };

    const updatedArtifact = await updateArtifactRecord(artifactId, {
        content: { ...content, cards } as Prisma.InputJsonValue,
        metadata: updatedMetadata as Prisma.InputJsonValue,
    });

    return {
        artifact: updatedArtifact,
        card: updatedCard,
        schedule: sm2Result,
    };
}

/**
 * Gets all due flashcards across the workspace.
 */
export async function getDueFlashcardsForWorkspace(
    workspaceId: string,
    userId: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const artifacts = await prisma.learningArtifact.findMany({
        where: {
            workspaceId,
            type: "FLASHCARDS",
            status: "READY",
        },
        select: {
            id: true,
            title: true,
            content: true,
            updatedAt: true,
        },
    });

    const now = Date.now();
    let totalDueCardsCount = 0;
    let totalCardsCount = 0;
    const dueDecks: Array<{
        artifactId: string;
        title: string;
        totalCards: number;
        dueCardsCount: number;
    }> = [];

    for (const art of artifacts) {
        const content = (art.content as Record<string, unknown>) || {};
        const cards = (content.cards as Array<Record<string, unknown>>) || [];
        totalCardsCount += cards.length;

        let dueInDeck = 0;
        for (const card of cards) {
            if (!card.dueDate) {
                dueInDeck += 1;
            } else {
                const dueTime = new Date(card.dueDate as string).getTime();
                if (dueTime <= now) {
                    dueInDeck += 1;
                }
            }
        }

        if (dueInDeck > 0) {
            totalDueCardsCount += dueInDeck;
            dueDecks.push({
                artifactId: art.id,
                title: art.title,
                totalCards: cards.length,
                dueCardsCount: dueInDeck,
            });
        }
    }

    return {
        totalCardsCount,
        totalDueCardsCount,
        dueDecks,
    };
}

/**
 * Aggregates user-wide study stats, streak, and daily heatmap review counts.
 */
export async function getUserStudyStats(userId: string) {
    const artifacts = await prisma.learningArtifact.findMany({
        where: {
            workspace: { userId },
            type: "FLASHCARDS",
            status: "READY",
        },
        select: {
            content: true,
            metadata: true,
            updatedAt: true,
        },
    });

    const now = Date.now();
    let totalCards = 0;
    let totalDueToday = 0;
    let totalMastered = 0;
    let totalLearning = 0;

    const dailyActivityMap: Record<string, number> = {};

    for (const art of artifacts) {
        const content = (art.content as Record<string, unknown>) || {};
        const cards = (content.cards as Array<Record<string, unknown>>) || [];
        totalCards += cards.length;

        for (const card of cards) {
            const state = card.state as string | undefined;
            if (state === "MASTERED") totalMastered += 1;
            else if (state === "LEARNING") totalLearning += 1;

            if (!card.dueDate) {
                totalDueToday += 1;
            } else {
                const dueTime = new Date(card.dueDate as string).getTime();
                if (dueTime <= now) {
                    totalDueToday += 1;
                }
            }

            if (card.lastReviewedAt) {
                const dateKey = (card.lastReviewedAt as string).split("T")[0];
                dailyActivityMap[dateKey] = (dailyActivityMap[dateKey] || 0) + 1;
            }
        }
    }

    const heatmap: Array<{ date: string; count: number; level: number }> = [];
    const today = new Date();
    let currentStreak = 0;
    let checkStreak = true;

    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().split("T")[0];
        const count = dailyActivityMap[dateKey] || 0;

        let level = 0;
        if (count >= 20) level = 4;
        else if (count >= 10) level = 3;
        else if (count >= 5) level = 2;
        else if (count >= 1) level = 1;

        heatmap.push({ date: dateKey, count, level });
    }

    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().split("T")[0];
        const count = dailyActivityMap[dateKey] || 0;

        if (count > 0 && checkStreak) {
            currentStreak += 1;
        } else if (i === 0 && count === 0) {
            continue;
        } else {
            checkStreak = false;
        }
    }

    const todayKey = today.toISOString().split("T")[0];
    const reviewedToday = dailyActivityMap[todayKey] || 0;

    return {
        totalCards,
        totalDueToday,
        totalMastered,
        totalLearning,
        reviewedToday,
        currentStreak,
        heatmap,
    };
}
