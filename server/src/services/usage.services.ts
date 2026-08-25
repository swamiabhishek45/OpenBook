import {
    countUserMessages,
    countUserSources,
    countUserWorkspaces,
    findUserPlanDetails,
    findUserTotalArtifacts,
    incrementUserArtifactCount as incrementUserArtifactCountRepo,
} from "../repository/user.repository.js";
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

    const isExpired =
        user?.planExpiresAt && new Date(user.planExpiresAt) <= new Date();

    const plan: PlanType = isExpired ? "FREE" : user?.plan ?? "FREE";
    const isPro = plan === "PRO" || plan === "PRO_PLUS";
    const isProPlus = plan === "PRO_PLUS";

    return {
        plan,
        planExpiresAt: user?.planExpiresAt ?? null,
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
    const { plan, isPro, isProPlus, planExpiresAt, limits } =
        await getUserPlan(userId);

    const [workspaceCount, sourceCount, userArtifacts, messageCount] =
        await Promise.all([
            countUserWorkspaces(userId),
            countUserSources(userId),
            findUserTotalArtifacts(userId),
            countUserMessages(userId),
        ]);

    const totalArtifactsCreated = userArtifacts?.totalArtifactsCreated ?? 0;

    return {
        plan,
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
 * Enforces source document upload quotas based on the user's active subscription plan.
 *
 * @param userId - Unique identifier of the user
 * @throws {ForbiddenError} When the source limit for the user's plan is reached
 */
export async function assertCanCreateSource(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    const count = await countUserSources(userId);
    if (count >= limits.SOURCES) {
        const nextPlan = plan === "FREE" ? "Pro" : "Pro+";
        throw new ForbiddenError(
            `${plan} plan limit reached: You can upload a maximum of ${limits.SOURCES} sources on the ${plan} plan. Upgrade to ${nextPlan} for more sources.`,
            {
                code: "LIMIT_REACHED",
                limitType: "sources",
                current: count,
                max: limits.SOURCES,
                plan,
            } satisfies LimitDetails & { code: string },
        );
    }
}

/**
 * Enforces total lifetime/period artifact generation quotas based on the user's subscription plan.
 *
 * @param userId - Unique identifier of the user
 * @throws {ForbiddenError} When the artifact creation limit for the plan is reached
 */
export async function assertCanCreateArtifact(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    const user = await findUserTotalArtifacts(userId);
    const totalCreated = user?.totalArtifactsCreated ?? 0;

    if (totalCreated >= limits.ARTIFACTS) {
        const nextPlan = plan === "FREE" ? "Pro" : "Pro+";
        throw new ForbiddenError(
            `${plan} plan limit reached: You have already created ${totalCreated} of ${limits.ARTIFACTS} allowed artifacts on the ${plan} plan. Deleting artifacts does not restore your quota. Upgrade to ${nextPlan} for more artifacts.`,
            {
                code: "LIMIT_REACHED",
                limitType: "artifacts",
                current: totalCreated,
                max: limits.ARTIFACTS,
                plan,
            } satisfies LimitDetails & { code: string },
        );
    }
}

/**
 * Checks feature gating permissions for specialized artifact types (e.g. Podcasts requiring Pro/Pro+).
 *
 * @param userId - Unique identifier of the user
 * @param artifactType - Type of artifact being requested (e.g. "PODCAST")
 * @throws {ForbiddenError} When attempting to create a premium artifact on a restricted plan
 */
export async function assertCanCreateArtifactType(
    userId: string,
    artifactType: string,
): Promise<void> {
    const { plan, isPro } = await getUserPlan(userId);

    if (artifactType === "PODCAST" && !isPro) {
        throw new ForbiddenError(
            "Audio Debate Podcast is an exclusive feature for Pro and Pro+ members. Upgrade to Pro to generate AI voice podcasts.",
            {
                code: "PRO_FEATURE_REQUIRED",
                limitType: "artifacts",
                current: 0,
                max: 0,
                plan,
            } satisfies LimitDetails & { code: string },
        );
    }
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
 * Enforces chat message quotas based on the user's active subscription plan.
 *
 * @param userId - Unique identifier of the user
 * @throws {ForbiddenError} When the free chat message quota is exhausted
 */
export async function assertCanSendMessage(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    if (limits.MESSAGES === null) {
        return; // Unlimited chats
    }

    const count = await countUserMessages(userId);
    if (count >= limits.MESSAGES) {
        throw new ForbiddenError(
            `${plan} plan limit reached: You can send a maximum of ${limits.MESSAGES} chat messages on the ${plan} plan. Upgrade to Pro for unlimited chats.`,
            {
                code: "LIMIT_REACHED",
                limitType: "messages",
                current: count,
                max: limits.MESSAGES,
                plan,
            } satisfies LimitDetails & { code: string },
        );
    }
}
