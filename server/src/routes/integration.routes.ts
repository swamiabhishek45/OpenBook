import { Router } from "express";
import {
    getConnectedIntegrations,
    disconnectIntegration,
    getGoogleDriveAuth,
    googleDriveCallback,
    listDriveFiles,
    importDriveFile,
    getNotionAuth,
    connectNotionToken,
    notionOAuthCallback,
    listPages,
    importPage,
    exportToNotion,
    getGithubAuth,
    githubCallback,
    importGithub,
} from "../controllers/integration.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const integrationRoutes = Router();

// Public OAuth callbacks (handled via query code & state/session)
integrationRoutes.get("/google-drive/callback", asyncHandler(googleDriveCallback));
integrationRoutes.get("/notion/callback", asyncHandler(notionOAuthCallback));
integrationRoutes.get("/github/callback", asyncHandler(githubCallback));

// Authenticated integration routes
integrationRoutes.use(requireAuth);

integrationRoutes.get("/", asyncHandler(getConnectedIntegrations));
integrationRoutes.delete("/:provider", asyncHandler(disconnectIntegration));

// Google Drive
integrationRoutes.get("/google-drive/auth-url", asyncHandler(getGoogleDriveAuth));
integrationRoutes.get("/google-drive/files", asyncHandler(listDriveFiles));

// Notion
integrationRoutes.get("/notion/auth-url", asyncHandler(getNotionAuth));
integrationRoutes.post("/notion/connect", asyncHandler(connectNotionToken));
integrationRoutes.get("/notion/pages", asyncHandler(listPages));

// GitHub
integrationRoutes.get("/github/auth-url", asyncHandler(getGithubAuth));
