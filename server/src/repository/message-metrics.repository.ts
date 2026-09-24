import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export type CreateMessageMetricsData = {
    messageId: string;
    embedTokens?: number;
    llmPromptTokens?: number;
    llmCompletionTokens?: number;
    rerankCalls?: number;
    embedCacheHit?: boolean;
    stagesMs?: Prisma.InputJsonValue;
    estimatedCostUsd?: number;
};

export function createMessageMetricsRecord(data: CreateMessageMetricsData) {
    return prisma.messageMetrics.create({
        data: {
            messageId: data.messageId,
            embedTokens: data.embedTokens,
            llmPromptTokens: data.llmPromptTokens,
            llmCompletionTokens: data.llmCompletionTokens,
            rerankCalls: data.rerankCalls,
            embedCacheHit: data.embedCacheHit,
            stagesMs: data.stagesMs,
            estimatedCostUsd: data.estimatedCostUsd,
        },
    });
}
