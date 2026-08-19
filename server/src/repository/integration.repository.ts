import prisma from "../lib/db.js";
import type { IntegrationProvider, Prisma } from "../generated/prisma/client.js";

export function findConnectedAccountsByUserId(userId: string) {
    return prisma.connectedAccount.findMany({
        where: { userId },
        select: {
            id: true,
            provider: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export function findConnectedAccount(
    userId: string,
    provider: IntegrationProvider,
) {
    return prisma.connectedAccount.findUnique({
        where: {
            userId_provider: {
                userId,
                provider,
            },
        },
    });
}

export interface UpsertConnectedAccountData {
    userId: string;
    provider: IntegrationProvider;
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: Date | null;
    metadata?: Prisma.InputJsonValue;
}

export function upsertConnectedAccountRecord(data: UpsertConnectedAccountData) {
    return prisma.connectedAccount.upsert({
        where: {
            userId_provider: {
                userId: data.userId,
                provider: data.provider,
            },
        },
        create: {
            userId: data.userId,
            provider: data.provider,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || null,
            expiresAt: data.expiresAt || null,
            metadata: data.metadata,
        },
        update: {
            accessToken: data.accessToken,
            refreshToken:
                data.refreshToken !== undefined ? data.refreshToken : undefined,
            expiresAt: data.expiresAt,
            metadata: data.metadata,
        },
    });
}

export function updateConnectedAccountTokens({
    id,
    accessToken,
    expiresAt,
}: {
    id: string;
    accessToken: string;
    expiresAt?: Date | null;
}) {
    return prisma.connectedAccount.update({
        where: { id },
        data: {
            accessToken,
            expiresAt: expiresAt || null,
        },
    });
}

export function deleteConnectedAccountByProvider(
    userId: string,
    provider: IntegrationProvider,
) {
    return prisma.connectedAccount.deleteMany({
        where: {
            userId,
            provider,
        },
    });
}
