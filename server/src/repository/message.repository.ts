import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export const messageSelect = {
    id: true,
    conversationId: true,
    role: true,
    content: true,
    citations: true,
    createdAt: true,
} as const;

export type MessageRecord = Prisma.MessageGetPayload<{
    select: typeof messageSelect;
}>;

export type CreateMessageData = {
    conversationId: string;
    role: MessageRecord["role"];
    content: string;
    citations?: Prisma.InputJsonValue;
};

/**
 * Queries all messages in a conversation in chronological order.
 *
 * @param conversationId - Unique identifier of the conversation
 * @returns Promise resolving to list of message records
 */
export function findMessagesByConversationId(conversationId: string) {
    return prisma.message.findMany({
        where: { conversationId },
        select: messageSelect,
        orderBy: { createdAt: "asc" },
    });
}

/**
 * Counts the total number of messages in a given conversation.
 *
 * @param conversationId - Unique identifier of the conversation
 * @returns Promise resolving to message count integer
 */
export function countMessagesByConversationId(conversationId: string) {
    return prisma.message.count({
        where: { conversationId },
    });
}

/**
 * Inserts a new chat message record (USER or ASSISTANT) with optional citations into PostgreSQL.
 *
 * @param data - Message payload containing conversationId, role, content, and citations
 * @returns Promise resolving to the newly created message record
 */
export function createMessageRecord(data: CreateMessageData) {
    return prisma.message.create({
        data: {
            conversationId: data.conversationId,
            role: data.role,
            content: data.content,
            citations: data.citations,
        },
        select: messageSelect,
    });
}