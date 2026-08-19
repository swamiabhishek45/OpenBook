import prisma from "../lib/db.js";
import type { PlanType } from "../generated/prisma/client.js";

export function findUserPlanDetails(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            plan: true,
            planExpiresAt: true,
            totalArtifactsCreated: true,
        },
    });
}

export function findUserById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            plan: true,
            planExpiresAt: true,
            totalArtifactsCreated: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export function updateUserPlan(userId: string, plan: PlanType) {
    return prisma.user.update({
        where: { id: userId },
        data: { plan },
        select: {
            id: true,
            email: true,
            name: true,
            plan: true,
        },
    });
}

export function incrementUserArtifactCount(userId: string) {
    return prisma.user.update({
        where: { id: userId },
        data: { totalArtifactsCreated: { increment: 1 } },
        select: { totalArtifactsCreated: true },
    });
}

export function findUserTotalArtifacts(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { totalArtifactsCreated: true },
    });
}

export function countUserWorkspaces(userId: string) {
    return prisma.workspace.count({
        where: { userId },
    });
}

export function countUserSources(userId: string) {
    return prisma.source.count({
        where: { workspace: { userId } },
    });
}

export function countUserMessages(userId: string) {
    return prisma.message.count({
        where: {
            role: "USER",
            conversation: { workspace: { userId } },
        },
    });
}
