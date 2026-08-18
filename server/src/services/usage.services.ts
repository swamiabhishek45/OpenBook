import prisma from "../lib/db.js";
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

export async function getUserPlan(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, planExpiresAt: true },
    });

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

export async function getUserUsage(userId: string) {
    const { plan, isPro, isProPlus, planExpiresAt, limits } =
        await getUserPlan(userId);

    const [workspaceCount, sourceCount, user, messageCount] =
        await Promise.all([
            prisma.workspace.count({
                where: { userId },
            }),
            prisma.source.count({
                where: { workspace: { userId } },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { totalArtifactsCreated: true },
            }),
            prisma.message.count({
                where: {
                    role: "USER",
                    conversation: { workspace: { userId } },
                },
            }),
        ]);

    const totalArtifactsCreated = user?.totalArtifactsCreated ?? 0;

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

export async function assertCanCreateWorkspace(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    const count = await prisma.workspace.count({ where: { userId } });
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

export async function assertCanCreateSource(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    const count = await prisma.source.count({
        where: { workspace: { userId } },
    });
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

export async function assertCanCreateArtifact(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalArtifactsCreated: true },
    });
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

export async function incrementArtifactCount(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { totalArtifactsCreated: { increment: 1 } },
    });
}

export async function assertCanSendMessage(userId: string): Promise<void> {
    const { plan, limits } = await getUserPlan(userId);

    if (limits.MESSAGES === null) {
        return; // Unlimited chats
    }

    const count = await prisma.message.count({
        where: {
            role: "USER",
            conversation: { workspace: { userId } },
        },
    });
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
