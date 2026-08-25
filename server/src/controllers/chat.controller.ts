import type { Request, Response } from "express";
import type { UIMessage } from "ai";
import {
    createConversationForWorkspace,
    deleteConversationForWorkspace,
    getConversationMessagesForWorkspace,
    listConversationsForWorkspace,
    streamWorkspaceChat,
} from "../services/chat.services.js";
import {
    chatBodySchema,
    conversationIdParamSchema,
    createConversationSchema,
} from "../validators/chat.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";

/**
 * Handles HTTP GET request to list all conversations within a workspace.
 *
 * @param req - Express request with workspaceId URL param
 * @param res - Express response returning array of conversation records
 */
export async function listConversations(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const conversations = await listConversationsForWorkspace(
        workspaceId,
        req.session.user.id,
    );
    res.json(conversations);
}

/**
 * Handles HTTP POST request to explicitly create an empty conversation in a workspace.
 *
 * @param req - Express request with workspaceId param and optional title in body
 * @param res - Express response returning 201 Created with conversation record
 */
export async function createConversation(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = createConversationSchema.parse(req.body ?? {});
    const conversation = await createConversationForWorkspace(
        workspaceId,
        req.session.user.id,
        input.title,
    );
    res.status(201).json(conversation);
}

/**
 * Handles HTTP GET request to fetch the complete message history for a conversation.
 *
 * @param req - Express request with workspaceId and conversationId params
 * @param res - Express response returning message list with citations
 */
export async function listConversationMessages(req: Request, res: Response) {
    const { workspaceId, conversationId } =
        conversationIdParamSchema.parse(req.params);
    const messages = await getConversationMessagesForWorkspace(
        workspaceId,
        conversationId,
        req.session.user.id,
    );
    res.json(messages);
}

/**
 * Handles HTTP DELETE request to delete a conversation and its messages.
 *
 * @param req - Express request with workspaceId and conversationId params
 * @param res - Express response returning 204 No Content
 */
export async function deleteConversation(req: Request, res: Response) {
    const { workspaceId, conversationId } =
        conversationIdParamSchema.parse(req.params);
    await deleteConversationForWorkspace(
        workspaceId,
        conversationId,
        req.session.user.id,
    );
    res.status(204).send();
}

/**
 * Handles HTTP POST request to stream grounded RAG chat responses via Server-Sent Events / UI message stream.
 *
 * @param req - Express request with workspaceId param and chat message history in body
 * @param res - Express streaming response object
 */
export async function streamChat(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const body = chatBodySchema.parse(req.body);

    await streamWorkspaceChat(res, workspaceId, req.session.user.id, {
        conversationId: body.conversationId,
        messages: body.messages as unknown as UIMessage[],
        model: body.model,
        webSearch: body.webSearch,
    });
}