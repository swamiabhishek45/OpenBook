import type { Request, Response } from "express";
import prisma from "../lib/db.js";
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
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";
import { artifactIdParamSchema } from "../validators/artifact.validator.js";
import { ValidationError } from "../types/app-error.js";

/**
 * List all connected integrations for current user.
 */
export async function getConnectedIntegrations(req: Request, res: Response) {
    const accounts = await prisma.connectedAccount.findMany({
        where: { userId: req.session.user.id },
        select: {
            id: true,
            provider: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
        },
    });

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
 * Disconnect an integration.
 */
export async function disconnectIntegration(req: Request, res: Response) {
    const { provider } = req.params;
    const provUpper = String(provider || "").toUpperCase().replace("-", "_");

    await prisma.connectedAccount.deleteMany({
        where: {
            userId: req.session.user.id,
            provider: provUpper as "GOOGLE_DRIVE" | "NOTION",
        },
    });

    res.json({ success: true });
}


// ---------------- Google Drive Handlers ----------------

export async function getGoogleDriveAuth(req: Request, res: Response) {
    const url = getGoogleDriveAuthUrl(req.session.user.id);
    res.json({ url });
}

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

export async function listDriveFiles(req: Request, res: Response) {
    const { search } = req.query;
    const data = await listGoogleDriveFiles(
        req.session.user.id,
        search ? String(search) : undefined,
    );
    res.json(data);
}

export async function importDriveFile(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const { fileId } = req.body;

    if (!fileId) {
        throw new ValidationError("File ID is required.");
    }

    const source = await importGoogleDriveFile({
        workspaceId,
        userId: req.session.user.id,
        fileId: String(fileId),
    });

    res.status(201).json(source);
}

// ---------------- Notion Handlers ----------------

export async function getNotionAuth(req: Request, res: Response) {
    const url = getNotionAuthUrl(req.session.user.id);
    res.json({ url });
}

export async function connectNotionToken(req: Request, res: Response) {
    const { token } = req.body;
    const account = await connectNotionWithToken({
        userId: req.session.user.id,
        token: String(token || ""),
    });
    res.json({ success: true, account });
}

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

export async function listPages(req: Request, res: Response) {
    const { search } = req.query;
    const data = await listNotionPages(
        req.session.user.id,
        search ? String(search) : undefined,
    );
    res.json(data);
}

export async function importPage(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const { pageId } = req.body;

    if (!pageId) {
        throw new ValidationError("Page ID is required.");
    }

    const source = await importNotionPage({
        workspaceId,
        userId: req.session.user.id,
        pageId: String(pageId),
    });

    res.status(201).json(source);
}

export async function exportToNotion(req: Request, res: Response) {
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(req.params);
    const { parentPageId } = req.body;

    const result = await exportArtifactToNotion({
        workspaceId,
        artifactId,
        userId: req.session.user.id,
        parentPageId: parentPageId ? String(parentPageId) : undefined,
    });

    res.json(result);
}
