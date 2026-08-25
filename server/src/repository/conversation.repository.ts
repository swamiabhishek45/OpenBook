import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export const conversationSelect = {
    id: true,
    workspaceId: true,
    title: true,
    summary: true,
    summaryMessageCount: true,
    summarizedAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type ConversationRecord = Prisma.ConversationGetPayload<{
    select: typeof conversationSelect;
}>;

/**
 * Queries all conversations within a workspace ordered by most recent activity.
 *
 * @param workspaceId - Workspace identifier
 * @returns Promise resolving to list of conversation records
 */
export function findConversationsByWorkspaceId(workspaceId: string) {
    return prisma.conversation.findMany({
        where: { workspaceId },
        select: conversationSelect,
        orderBy: { updatedAt: "desc" },
    });
}

/**
 * Queries a conversation record by its unique ID.
 *
 * @param conversationId - Unique identifier of the conversation
 * @returns Promise resolving to matching conversation record or null
 */
export function findConversationById(conversationId: string) {
    return prisma.conversation.findUnique({
        where: { id: conversationId },
        select: conversationSelect,
    });
}

/**
 * Queries a conversation scoped by conversationId and workspaceId.
 *
 * @param conversationId - Unique identifier of the conversation
 * @param workspaceId - Workspace identifier
 * @returns Promise resolving to matching conversation record or null
 */
export function findConversationByIdAndWorkspaceId(
    conversationId: string,
    workspaceId: string,
) {
    return prisma.conversation.findFirst({
        where: { id: conversationId, workspaceId },
        select: conversationSelect,
    });
}

/**
 * Inserts a new conversation record into PostgreSQL.
 *
 * @param workspaceId - Workspace identifier
 * @param title - Optional display title for the conversation
 * @returns Promise resolving to created conversation record
 */
export function createConversationRecord(workspaceId: string, title?: string) {
    return prisma.conversation.create({
        data: {
            workspaceId,
            title: title ?? null,
        },
        select: conversationSelect,
    });
}

/**
 * Updates the rolling summary and summary message count of a conversation.
 *
 * @param conversationId - Unique identifier of the conversation
 * @param data - Summary text and processed message count
 * @returns Promise resolving to updated conversation record
 */
export function updateConversationSummary(
    conversationId: string,
    data: {
        summary: string;
        summaryMessageCount: number;
    },
) {
    return prisma.conversation.update({
        where: { id: conversationId },
        data: {
            summary: data.summary,
            summaryMessageCount: data.summaryMessageCount,
            summarizedAt: new Date(),
        },
        select: conversationSelect,
    });
}

/**
 * Updates properties (such as title) of an existing conversation.
 *
 * @param conversationId - Unique identifier of the conversation
 * @param data - Update payload
 * @returns Promise resolving to updated conversation record
 */
export function updateConversationRecord(
    conversationId: string,
    data: { title?: string | null },
) {
    return prisma.conversation.update({
        where: { id: conversationId },
        data,
        select: conversationSelect,
    });
}

/**
 * Updates the `updatedAt` timestamp of a conversation to mark recent activity.
 *
 * @param conversationId - Unique identifier of the conversation
 * @returns Promise resolving to updated conversation record
 */
export function touchConversation(conversationId: string) {
    return prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
        select: conversationSelect,
    });
}

/**
 * Deletes a conversation record and its associated messages from PostgreSQL.
 *
 * @param conversationId - Unique identifier of the conversation to delete
 */
export async function deleteConversationRecord(conversationId: string) {
    await prisma.conversation.delete({
        where: { id: conversationId },
    });
}