import { getWorkspaceByIdForUser } from "./workspace.services.js";
import { assertCanCreateSource } from "./usage.services.js";
import { createAndProcessSource } from "./source.services.js";
import {
    findConnectedAccount,
    updateConnectedAccountTokens,
    upsertConnectedAccountRecord,
} from "../repository/integration.repository.js";
import { extractText } from "unpdf";
import { NotFoundError, ValidationError } from "../types/app-error.js";
import type { Prisma } from "../generated/prisma/client.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const serverBaseUrl =
    process.env.SERVER_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:8081";
const GOOGLE_REDIRECT_URI =
    process.env.GOOGLE_REDIRECT_URI ||
    `${serverBaseUrl}/api/integrations/google-drive/callback`;

/**
 * Generates the Google OAuth 2.0 authorization URL for read-only Google Drive access.
 *
 * @param userId - Unique identifier of the user (passed in OAuth state parameter)
 * @returns Complete Google OAuth consent screen URL
 * @throws {ValidationError} When Google Client ID is not configured on the server
 */
export function getGoogleDriveAuthUrl(userId: string): string {
    if (!GOOGLE_CLIENT_ID) {
        throw new ValidationError("Google Client ID is not configured on the server.");
    }

    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        access_type: "offline",
        prompt: "consent",
        state: userId,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges the Google OAuth authorization code for access/refresh tokens and persists the connected account.
 *
 * @param params - Object containing authorization code and userId
 * @param params.code - Authorization code returned from Google OAuth redirect
 * @param params.userId - Authenticated user's identifier
 * @returns The persisted connected account record
 * @throws {ValidationError} If code is missing or token exchange with Google fails
 */
export async function handleGoogleDriveCallback({
    code,
    userId,
}: {
    code: string;
    userId: string;
}) {
    if (!code) {
        throw new ValidationError("Authorization code is missing.");
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Google token exchange error:", errText);
        throw new ValidationError("Failed to exchange Google authorization code.");
    }

    const tokenData = (await tokenRes.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
    };
    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch user info for metadata
    let email = "Google User";
    let name = "Google Account";
    try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        if (userRes.ok) {
            const userData = (await userRes.json()) as {
                email?: string;
                name?: string;
            };
            email = userData.email || email;
            name = userData.name || name;
        }
    } catch {}

    const expiresAt = expires_in
        ? new Date(Date.now() + expires_in * 1000)
        : null;

    const account = await upsertConnectedAccountRecord({
        userId,
        provider: "GOOGLE_DRIVE",
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt,
        metadata: { email, name },
    });

    return account;
}

/**
 * Ensures a valid Google Drive access token, automatically refreshing it if expired.
 *
 * @param userId - Unique identifier of the user
 * @returns Valid active access token string
 * @throws {NotFoundError} If Google Drive is not connected for the user
 * @throws {ValidationError} If token expired and refresh fails
 */
async function getValidAccessToken(userId: string): Promise<string> {
    const account = await findConnectedAccount(userId, "GOOGLE_DRIVE");

    if (!account) {
        throw new NotFoundError("Google Drive is not connected for this account.");
    }

    const isExpired = account.expiresAt && new Date(account.expiresAt) <= new Date();

    if (!isExpired) {
        return account.accessToken;
    }

    if (!account.refreshToken) {
        throw new ValidationError("Google Drive access token expired and no refresh token is available. Please reconnect.");
    }

    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: account.refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!refreshRes.ok) {
        throw new ValidationError("Failed to refresh Google Drive token. Please reconnect.");
    }

    const refreshData = (await refreshRes.json()) as {
        access_token: string;
        expires_in?: number;
    };
    const newAccessToken = refreshData.access_token;
    const newExpiresAt = refreshData.expires_in
        ? new Date(Date.now() + refreshData.expires_in * 1000)
        : null;

    await updateConnectedAccountTokens({
        id: account.id,
        accessToken: newAccessToken,
        expiresAt: newExpiresAt,
    });

    return newAccessToken;
}

/**
 * Lists readable Google Docs and PDFs in the connected user's Google Drive.
 *
 * @param userId - Authenticated user's identifier
 * @param search - Optional keyword search filter for document filenames
 * @returns List of normalized file metadata objects
 * @throws {ValidationError} If fetching files from Google Drive API fails
 */
export async function listGoogleDriveFiles(userId: string, search?: string) {
    const token = await getValidAccessToken(userId);

    let query = "trashed = false and (mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document')";
    if (search && search.trim()) {
        const sanitized = search.replace(/'/g, "\\'");
        query += ` and name contains '${sanitized}'`;
    }

    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", query);
    url.searchParams.set("pageSize", "30");
    url.searchParams.set(
        "fields",
        "files(id, name, mimeType, size, iconLink, modifiedTime, thumbnailLink, webViewLink)",
    );
    url.searchParams.set("orderBy", "modifiedTime desc");

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Google Drive list files error:", err);
        throw new ValidationError("Failed to list Google Drive files.");
    }

    const data = (await res.json()) as {
        files?: Array<Record<string, unknown>>;
    };
    return {
        files: (data.files || []).map((file: Record<string, unknown>) => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size ? Number(file.size) : null,
            iconLink: file.iconLink,
            modifiedTime: file.modifiedTime,
            webViewLink: file.webViewLink,
            type:
                file.mimeType === "application/vnd.google-apps.document"
                    ? "GOOGLE_DOC"
                    : "PDF",
        })),
    };
}

/**
 * Downloads and imports a Google Doc or Google Drive PDF directly as a workspace Source.
 *
 * @param params - Import payload
 * @param params.workspaceId - Target workspace identifier
 * @param params.userId - Authenticated user's identifier
 * @param params.fileId - Google Drive file identifier
 * @returns The created and enqueued Source record
 * @throws {NotFoundError} If the Drive file is not found
 * @throws {ValidationError} If file format is unsupported or text extraction fails
 */
export async function importGoogleDriveFile({
    workspaceId,
    userId,
    fileId,
}: {
    workspaceId: string;
    userId: string;
    fileId: string;
}) {
    // 1. Verify workspace access and quota
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateSource(userId);

    const token = await getValidAccessToken(userId);

    // 2. Fetch file metadata
    const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink`,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );

    if (!metaRes.ok) {
        throw new NotFoundError("Google Drive file not found or inaccessible.");
    }

    const fileMeta = (await metaRes.json()) as {
        name?: string;
        mimeType?: string;
        webViewLink?: string;
    };
    const title = fileMeta.name || "Untitled Google Drive File";
    const mimeType = fileMeta.mimeType;

    let extractedText = "";
    let sourceType: "GOOGLE_DOC" | "PDF" = "GOOGLE_DOC";

    // 3. Extract text based on file type
    if (mimeType === "application/vnd.google-apps.document") {
        sourceType = "GOOGLE_DOC";
        // Export Google Doc as plain text
        const exportRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        if (!exportRes.ok) {
            throw new ValidationError("Failed to export Google Doc text content.");
        }
        extractedText = await exportRes.text();
    } else if (mimeType === "application/pdf") {
        sourceType = "PDF";
        // Download PDF binary stream
        const downloadRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        if (!downloadRes.ok) {
            throw new ValidationError("Failed to download Drive PDF.");
        }

        const arrayBuffer = await downloadRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { text } = await extractText(new Uint8Array(buffer));
        extractedText = Array.isArray(text) ? text.join("\n\n") : String(text || "");
    } else {
        throw new ValidationError("Unsupported file type. Only Google Docs and PDFs can be imported.");
    }

    if (!extractedText || !extractedText.trim()) {
        throw new ValidationError("No readable text found in the selected file.");
    }

    // 4. Ingest via source chunking pipeline
    const source = await createAndProcessSource({
        workspaceId,
        type: sourceType,
        title,
        content: extractedText.trim(),
        url: fileMeta.webViewLink || undefined,
        status: "PENDING",
        metadata: {
            driveFileId: fileId,
            mimeType,
            importedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
    });

    return source;
}
