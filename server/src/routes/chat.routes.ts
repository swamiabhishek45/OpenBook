import { Router } from "express";
import {
    clearConversationMessages,
    createConversation,
    deleteConversation,
    listConversationMessages,
    listConversations,
    enhancePrompt,
    streamChat,
} from "../controllers/chat.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const conversationRoutes = Router({ mergeParams: true });

conversationRoutes.get("/", asyncHandler(listConversations));
conversationRoutes.post("/", asyncHandler(createConversation));
conversationRoutes.get(
    "/:conversationId/messages",
    asyncHandler(listConversationMessages),
);
conversationRoutes.delete(
    "/:conversationId/messages",
    asyncHandler(clearConversationMessages),
);
conversationRoutes.delete(
    "/:conversationId",
    asyncHandler(deleteConversation),
);

export const chatRoutes = Router({ mergeParams: true });

chatRoutes.post("/enhance-prompt", asyncHandler(enhancePrompt));
chatRoutes.post("/", asyncHandler(streamChat));