import {
    countUserMessages,
    countUserSources,
    countUserWorkspaces,
    findUserPlanDetails,
    findUserTotalArtifacts,
    incrementUserArtifactCount as incrementUserArtifactCountRepo,
} from "../repository/user.repository.js";
import {
    CREDIT_COSTS,
    deductCredits,
    getCreditHistory,
    getUserCredits,
} from "./credit.services.js";
import { ForbiddenError } from "../types/app-error.js";
import type { PlanType } from "../generated/prisma/client.js";

export const PLAN_LIMITS: Record<
    PlanType,
    {
        WORKSPACES: number;
        MESSAGES: number | null;
        SOURCES: number;
        ARTIFACTS: number;
    }
> = {
    FREE: {
        WORKSPACES: 1,
        MESSAGES: 10,
        SOURCES: 3,
        ARTIFACTS: 3,
    },
    PRO: {
        WORKSPACES: 3,
        MESSAGES: null, // Unlimited chats
        SOURCES: 15,
        ARTIFACTS: 10,
    },
    PRO_PLUS: {
        WORKSPACES: 10,
        MESSAGES: null, // Unlimited chats
        SOURCES: 30,
        ARTIFACTS: 25,
    },
};

export interface LimitDetails {
    limitType: "workspaces" | "artifacts" | "sources" | "messages";
    current: number;
    max: number | null;
    plan: PlanType;
}

/**
 * Retrieves the subscription plan details, expiration state, and associated resource limits for a user.
 *
 * @param userId - Unique identifier of the user
 * @returns An object containing the effective plan type, expiration date, pro flags, and plan limits
 */
export async function getUserPlan(userId: string) {
    const user = await findUserPlanDetails(userId);

    const subscriptionPlan: PlanType = user?.plan ?? "FREE";
    const planExpiresAt = user?.planExpiresAt ?? null;
    const subscriptionExpired =
        subscriptionPlan !== "FREE" &&
        planExpiresAt !== null &&
        new Date(planExpiresAt) <= new Date();

    const plan: PlanType = subscriptionExpired ? "FREE" : subscriptionPlan;
    const isPro = plan === "PRO" || plan === "PRO_PLUS";
    const isProPlus = plan === "PRO_PLUS";

    return {
        plan,
        subscriptionPlan,
        subscriptionExpired,
        planExpiresAt,
        isPro,
        isProPlus,
        limits: PLAN_LIMITS[plan],
    };
}

/**
 * Computes a user's current resource consumption against their plan limits across workspaces, sources, artifacts, and messages.
 *
 * @param userId - Unique identifier of the user
 * @returns Comprehensive usage metrics with current counts, maximum limits, and exceeded flags
 */
export async function getUserUsage(userId: string) {
    const {
        plan,
        subscriptionPlan,
        subscriptionExpired,
        isPro,
        isProPlus,
        planExpiresAt,
        limits,
    } = await getUserPlan(userId);

    const [workspaceCount, sourceCount, userArtifacts, messageCount, credits, creditHistory] =
        await Promise.all([
            countUserWorkspaces(userId),
            countUserSources(userId),
            findUserTotalArtifacts(userId),
            countUserMessages(userId),
            getUserCredits(userId),
            getCreditHistory(userId, 50),
        ]);

    const totalArtifactsCreated = userArtifacts?.totalArtifactsCreated ?? 0;

    return {
        credits,
        creditHistory,
        plan,
        subscriptionPlan,
        subscriptionExpired,
        isPro,
        isProPlus,
        planExpiresAt,
        workspaces: {
            count: workspaceCount,
            limit: limits.WORKSPACES,
            exceeded: workspaceCount >= limits.WORKSPACES,
        },
        sources: {
            count: sourceCount,
            limit: limits.SOURCES,
            exceeded: sourceCount >= limits.SOURCES,
        },
        artifacts: {
            count: totalArtifactsCreated,
            limit: limits.ARTIFACTS,
            exceeded: totalArtifactsCreated >= limits.ARTIFACTS,
        },
        messages: {
            count: messageCount,
            limit: limits.MESSAGES,
            exceeded:
                limits.MESSAGES !== null && messageCount >= limits.MESSAGES,
        },
    };
}

/**
 * Enforces workspace creation quotas based on the user's active subscription plan.
 *
 * @param userId - Unique identifier of the user
 * @throws {ForbiddenError} When the workspace limit for the user's plan is reached
 */
export async function assertCanCreateWorkspace(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    const count = await countUserWorkspaces(userId);
    if (count >= limits.WORKSPACES) {
        const nextPlan = plan === "FREE" ? "Pro" : "Pro+";
        throw new ForbiddenError(
            `${plan} plan limit reached: You can create a maximum of ${limits.WORKSPACES} workspace${limits.WORKSPACES > 1 ? "s" : ""} on the ${plan} plan. Upgrade to ${nextPlan} for more workspaces.`,
            {
                code: "LIMIT_REACHED",
                limitType: "workspaces",
                current: count,
                max: limits.WORKSPACES,
                plan,
            } satisfies LimitDetails & { code: string },
        );
    }
}

/**
 * Enforces source document upload credits: deducts 5 credits.
 *
 * @param userId - Unique identifier of the user
 * @throws {InsufficientCreditsError} When user does not have at least 5 credits
 */
export async function assertCanCreateSource(userId: string): Promise<void> {
    await deductCredits(
        userId,
        CREDIT_COSTS.SOURCE_UPLOAD,
        "SOURCE_UPLOAD",
        "Uploaded a source document",
    );
}

/**
 * Enforces artifact creation credits: deducts 10 credits for standard artifacts, 50 for audio debate.
 *
 * @param userId - Unique identifier of the user
 * @param artifactType - Type of artifact being created
 * @throws {InsufficientCreditsError} When user has insufficient credits
 */
export async function assertCanCreateArtifact(
    userId: string,
    artifactType?: string,
): Promise<void> {
    const cost =
        artifactType === "PODCAST"
            ? CREDIT_COSTS.AUDIO_DEBATE
            : CREDIT_COSTS.ARTIFACT_GENERATE;

    const type =
        artifactType === "PODCAST" ? "AUDIO_DEBATE" : "ARTIFACT_GENERATE";

    const description =
        artifactType === "PODCAST"
            ? "Generated an Audio Debate Podcast"
            : `Generated ${artifactType || "study"} artifact`;

    await deductCredits(userId, cost, type, description);
}

/**
 * Validates feature access for artifact types. Any user with 50 credits can generate Audio Debate Podcasts.
 *
 * @param userId - Unique identifier of the user
 * @param artifactType - Type of artifact being requested
 */
export async function assertCanCreateArtifactType(
    userId: string,
    artifactType: string,
): Promise<void> {
    // Feature gating is now credit-based: checked in assertCanCreateArtifact
}

/**
 * Increments the total artifact creation counter for a user in the database.
 *
 * @param userId - Unique identifier of the user
 */
export async function incrementArtifactCount(userId: string): Promise<void> {
    await incrementUserArtifactCountRepo(userId);
}

/**
 * Enforces chat message credits: deducts 1 credit per message.
 *
 * @param userId - Unique identifier of the user
 * @throws {InsufficientCreditsError} When user does not have at least 1 credit
 */
export async function assertCanSendMessage(userId: string): Promise<void> {
    await deductCredits(
        userId,
        CREDIT_COSTS.CHAT_MESSAGE,
        "CHAT_MESSAGE",
        "Sent a chat message",
    );
}
