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

export async function listConversations(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const conversations = await listConversationsForWorkspace(
        workspaceId,
        req.session.user.id,
    );
    res.json(conversations);
}

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