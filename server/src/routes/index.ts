import type { Express } from "express";
import { artifactRoutes } from "./artifact.routes.js";
import { chatRoutes, conversationRoutes } from "./chat.routes.js";
import { memoryRoutes } from "./memory.routes.js";
import { paymentRoutes } from "./payment.routes.js";
import { sourceRoutes } from "./source.routes.js";
import { userRoutes } from "./user.routes.js";
import { integrationRoutes } from "./integration.routes.js";
import { workspaceRoutes } from "./workspace.routes.js";
import { streamPodcastAudio } from "../controllers/artifact.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export function registerRoutes(app: Express): void {
    workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
    workspaceRoutes.use("/:workspaceId/artifacts", artifactRoutes);
    workspaceRoutes.use("/:workspaceId/conversations", conversationRoutes);
    workspaceRoutes.use("/:workspaceId/chat", chatRoutes);
    app.use("/api/workspaces", workspaceRoutes);
    app.use("/api/memory", memoryRoutes);
    app.use("/api/payment", paymentRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/integrations", integrationRoutes);

    // Direct audio streaming for HTML5 audio tags and downloads
    app.get("/api/audio/:workspaceId/:artifactId", asyncHandler(streamPodcastAudio));
}
