import prisma from "../lib/db.js";
import type { IntegrationProvider, Prisma } from "../generated/prisma/client.js";

/**
 * Queries all connected third-party integration accounts for a user (omitting token secrets).
 *
 * @param userId - Unique identifier of the user
 * @returns Promise resolving to list of connected account summaries
 */
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

/**
 * Queries a specific connected integration account including its stored tokens.
 *
 * @param userId - Unique identifier of the user
 * @param provider - Integration provider enum (GOOGLE_DRIVE, NOTION)
 * @returns Promise resolving to the connected account record or null
 */
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

/**
 * Creates or updates a connected account record with fresh tokens and provider metadata.
 *
 * @param data - Upsert data payload
 * @returns Promise resolving to the updated or created ConnectedAccount record
 */
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

/**
 * Updates the access token and expiration timestamp for a connected account.
 *
 * @param params - Object containing account id, new accessToken, and optional expiration
 * @returns Promise resolving to updated ConnectedAccount record
 */
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

/**
 * Deletes connected third-party integration accounts for a given user and provider.
 *
 * @param userId - Unique identifier of the user
 * @param provider - Provider to disconnect
 * @returns Promise resolving to deletion count
 */
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
