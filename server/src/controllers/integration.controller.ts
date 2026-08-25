import type { Request, Response } from "express";
import {
    deleteConnectedAccountByProvider,
    findConnectedAccountsByUserId,
} from "../repository/integration.repository.js";
import {
    getGoogleDriveAuthUrl,
    handleGoogleDriveCallback,
    listGoogleDriveFiles,
    importGoogleDriveFile,
} from "../services/google-drive.services.js";
import {
    getNotionAuthUrl,
    connectNotionWithToken,
    handleNotionOAuthCallback,
    listNotionPages,
    importNotionPage,
    exportArtifactToNotion,
} from "../services/notion.services.js";
import {
    connectNotionSchema,
    exportNotionSchema,
    importDriveFileSchema,
    importNotionPageSchema,
} from "../validators/integration.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";
import { artifactIdParamSchema } from "../validators/artifact.validator.js";
import { ValidationError } from "../types/app-error.js";
import type { IntegrationProvider } from "../generated/prisma/client.js";

/**
 * Handles HTTP GET request to list all connected third-party accounts (Google Drive, Notion) for the current user.
 *
 * @param req - Express request with authenticated session user
 * @param res - Express response returning connection status per provider
 */
export async function getConnectedIntegrations(req: Request, res: Response) {
    const accounts = await findConnectedAccountsByUserId(req.session.user.id);

    const result = {
        googleDrive: {
            connected: accounts.some((a) => a.provider === "GOOGLE_DRIVE"),
            account: accounts.find((a) => a.provider === "GOOGLE_DRIVE") || null,
        },
        notion: {
            connected: accounts.some((a) => a.provider === "NOTION"),
            account: accounts.find((a) => a.provider === "NOTION") || null,
        },
    };

    res.json(result);
}

/**
 * Handles HTTP DELETE request to disconnect a third-party integration provider.
 *
 * @param req - Express request with provider name in params
 * @param res - Express response confirming disconnection
 */
export async function disconnectIntegration(req: Request, res: Response) {
    const { provider } = req.params;
    const provUpper = String(provider || "").toUpperCase().replace("-", "_") as IntegrationProvider;

    await deleteConnectedAccountByProvider(req.session.user.id, provUpper);

    res.json({ success: true });
}

// ---------------- Google Drive Handlers ----------------

/**
 * Handles HTTP GET request to retrieve the Google OAuth authorization URL.
 *
 * @param req - Express request with session user
 * @param res - Express response returning { url: string }
 */
export async function getGoogleDriveAuth(req: Request, res: Response) {
    const url = getGoogleDriveAuthUrl(req.session.user.id);
    res.json({ url });
}

/**
 * Handles HTTP GET callback from Google OAuth redirect, stores tokens, and redirects user back to UI.
 *
 * @param req - Express request with OAuth code and state in query
 * @param res - Express response redirecting to frontend settings
 * @throws {ValidationError} When code or user session state is missing
 */
export async function googleDriveCallback(req: Request, res: Response) {
    const { code, state } = req.query;
    const userId = (state as string) || req.session?.user?.id;

    if (!userId) {
        throw new ValidationError("User session or state is missing.");
    }

    await handleGoogleDriveCallback({
        code: String(code),
        userId,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${clientUrl}/settings/integrations?connected=google-drive`);
}

/**
 * Handles HTTP GET request to list Google Docs and PDFs from the connected Google Drive.
 *
 * @param req - Express request with optional search term in query
 * @param res - Express response returning matching Google Drive files
 */
export async function listDriveFiles(req: Request, res: Response) {
    const { search } = req.query;
    const data = await listGoogleDriveFiles(
        req.session.user.id,
        search ? String(search) : undefined,
    );
    res.json(data);
}

/**
 * Handles HTTP POST request to import a selected Google Drive file as a workspace Source.
 *
 * @param req - Express request with workspaceId param and fileId in body
 * @param res - Express response returning 201 Created with source record
 */
export async function importDriveFile(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const { fileId } = importDriveFileSchema.parse(req.body);

    const source = await importGoogleDriveFile({
        workspaceId,
        userId: req.session.user.id,
        fileId,
    });

    res.status(201).json(source);
}

// ---------------- Notion Handlers ----------------

/**
 * Handles HTTP GET request to retrieve the Notion OAuth authorization URL.
 *
 * @param req - Express request with session user
 * @param res - Express response returning { url: string }
 */
export async function getNotionAuth(req: Request, res: Response) {
    const url = getNotionAuthUrl(req.session.user.id);
    res.json({ url });
}

/**
 * Handles HTTP POST request to connect a Notion workspace via an internal integration token.
 *
 * @param req - Express request with integration token in body
 * @param res - Express response returning connected account record
 */
export async function connectNotionToken(req: Request, res: Response) {
    const { token } = connectNotionSchema.parse(req.body);
    const account = await connectNotionWithToken({
        userId: req.session.user.id,
        token,
    });
    res.json({ success: true, account });
}

/**
 * Handles HTTP GET callback from Notion OAuth redirect, stores tokens, and redirects user to UI.
 *
 * @param req - Express request with OAuth code and state in query
 * @param res - Express response redirecting to frontend settings
 * @throws {ValidationError} When code or user session state is missing
 */
export async function notionOAuthCallback(req: Request, res: Response) {
    const { code, state } = req.query;
    const userId = (state as string) || req.session?.user?.id;

    if (!userId) {
        throw new ValidationError("User session or state is missing.");
    }

    await handleNotionOAuthCallback({
        code: String(code),
        userId,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${clientUrl}/settings/integrations?connected=notion`);
}

/**
 * Handles HTTP GET request to list accessible Notion pages and databases.
 *
 * @param req - Express request with optional query search string
 * @param res - Express response returning Notion pages
 */
export async function listPages(req: Request, res: Response) {
    const { search } = req.query;
    const data = await listNotionPages(
        req.session.user.id,
        search ? String(search) : undefined,
    );
    res.json(data);
}

/**
 * Handles HTTP POST request to import a Notion page as a workspace Source document.
 *
 * @param req - Express request with workspaceId param and pageId in body
 * @param res - Express response returning 201 Created with source record
 */
export async function importPage(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const { pageId } = importNotionPageSchema.parse(req.body);

    const source = await importNotionPage({
        workspaceId,
        userId: req.session.user.id,
        pageId,
    });

    res.status(201).json(source);
}

/**
 * Handles HTTP POST request to export a generated learning artifact to a Notion workspace page.
 *
 * @param req - Express request with workspaceId, artifactId, and optional parentPageId
 * @param res - Express response returning created Notion page URL and ID
 */
export async function exportToNotion(req: Request, res: Response) {
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(req.params);
    const { parentPageId } = exportNotionSchema.parse(req.body);

    const result = await exportArtifactToNotion({
        workspaceId,
        artifactId,
        userId: req.session.user.id,
        parentPageId,
    });

    res.json(result);
}
