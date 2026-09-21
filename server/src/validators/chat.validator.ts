import { z } from "zod";
import { CHAT_MODELS } from "../lib/ai-config.js";
import { workspaceIdParamSchema } from "./workspace.validator.js";

export const conversationIdParamSchema = workspaceIdParamSchema.extend({
    conversationId: z.string().trim().min(1, "Conversation id is required"),
});

export const chatBodySchema = z.object({
    conversationId: z.string().trim().min(1).optional(),
    messages: z.array(z.record(z.string(), z.unknown())).min(1),
    model: z.enum(CHAT_MODELS).optional(),
    webSearch: z.boolean().optional(),
});

export type ChatBody = z.infer<typeof chatBodySchema>;

export const createConversationSchema = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const enhancePromptSchema = z.object({
    prompt: z.string().trim().min(1).max(8000),
    sourcesCount: z.number().int().min(0).optional(),
});

export type EnhancePromptInput = z.infer<typeof enhancePromptSchema>;