import { getWorkspaceByIdForUser } from "./workspace.services.js";
import { assertCanCreateSource } from "./usage.services.js";
import { createAndProcessSource } from "./source.services.js";
import {
    findConnectedAccount,
    upsertConnectedAccountRecord,
} from "../repository/integration.repository.js";
import {
    fetchGithubRepoContent,
    parseGithubRepoUrl,
    GithubApiError,
} from "../lib/sources/github.js";
import { ValidationError } from "../types/app-error.js";
import type { Prisma } from "../generated/prisma/client.js";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

function normalizeBaseUrl(url: string): string {
    return url.trim().replace(/\/$/, "");
}

export function getGithubRedirectUri(): string {
    if (process.env.GITHUB_REDIRECT_URI?.trim()) {
        return process.env.GITHUB_REDIRECT_URI.trim();
    }

    const serverBaseUrl = normalizeBaseUrl(
        process.env.SERVER_URL ||
            process.env.BETTER_AUTH_URL ||
            "http://localhost:8081",
    );

    return `${serverBaseUrl}/api/integrations/github/callback`;
}

const GITHUB_REDIRECT_URI = getGithubRedirectUri();

export function encodeGithubOAuthState(userId: string, returnTo?: string): string {
    if (!returnTo) {
        return userId;
    }
    return `${userId}::${encodeURIComponent(returnTo)}`;
}

export function decodeGithubOAuthState(state: string): {
    userId: string;
    returnTo?: string;
} {
    const [userId, encodedReturnTo] = state.split("::");
    return {
        userId,
        returnTo: encodedReturnTo ? decodeURIComponent(encodedReturnTo) : undefined,
    };
}

/**
 * Generates the GitHub OAuth authorization URL for repository read access.
 */
export function getGithubAuthUrl(userId: string, returnTo?: string): string {
    if (!GITHUB_CLIENT_ID) {
        throw new ValidationError("GitHub Client ID is not configured on the server.");
    }

    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_REDIRECT_URI,
        scope: "repo read:user",
        state: encodeGithubOAuthState(userId, returnTo),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchanges the GitHub OAuth authorization code for an access token and persists the connected account.
 */
export async function handleGithubCallback({
    code,
    userId,
}: {
    code: string;
    userId: string;
}) {
    if (!code) {
        throw new ValidationError("Authorization code is missing.");
    }

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
        }),
    });

    const tokenBody = await tokenRes.text();

    if (!tokenRes.ok) {
        console.error("GitHub token exchange HTTP error:", tokenRes.status, tokenBody);
        throw new ValidationError("Failed to exchange GitHub authorization code.");
    }

    let tokenData: {
        access_token?: string;
        error?: string;
        error_description?: string;
    };

    try {
        tokenData = JSON.parse(tokenBody) as typeof tokenData;
    } catch {
        console.error("GitHub token exchange invalid JSON:", tokenBody);
        throw new ValidationError("Failed to exchange GitHub authorization code.");
    }

    if (!tokenData.access_token) {
        console.error("GitHub token exchange error:", tokenData);
        throw new ValidationError(
            tokenData.error_description ||
                tokenData.error ||
                "Failed to obtain GitHub access token. Check that the GitHub callback URL matches your OAuth app settings.",
        );
    }

    let login = "GitHub User";
    let name = "GitHub Account";
    let avatarUrl: string | undefined;

    try {
        const userRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: "application/vnd.github+json",
            },
        });
        if (userRes.ok) {
            const userData = (await userRes.json()) as {
                login?: string;
                name?: string;
                avatar_url?: string;
            };
            login = userData.login || login;
            name = userData.name || login;
            avatarUrl = userData.avatar_url;
        }
    } catch {}

    try {
        const account = await upsertConnectedAccountRecord({
            userId,
            provider: "GITHUB",
            accessToken: tokenData.access_token,
            refreshToken: null,
            expiresAt: null,
            metadata: { login, name, avatarUrl },
        });

        return account;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Failed to save GitHub connected account:", error);

        if (message.includes("IntegrationProvider") || message.includes("GITHUB")) {
            throw new ValidationError(
                "GitHub integration is not enabled in the database yet. Run: ALTER TYPE \"IntegrationProvider\" ADD VALUE IF NOT EXISTS 'GITHUB';",
            );
        }

        throw error;
    }
}

/**
 * Returns a GitHub access token for the user if connected, otherwise undefined.
 */
async function getOptionalAccessToken(userId: string): Promise<string | undefined> {
    const account = await findConnectedAccount(userId, "GITHUB");
    return account?.accessToken;
}

/**
 * Imports a GitHub repository as a workspace Source by fetching and indexing its text files.
 */
export async function importGithubRepo({
    workspaceId,
    userId,
    url,
    title,
}: {
    workspaceId: string;
    userId: string;
    url: string;
    title?: string;
}) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateSource(userId);

    const parsed = parseGithubRepoUrl(url);
    if (!parsed) {
        throw new ValidationError(
            "Invalid GitHub repository URL. Use https://github.com/owner/repo",
        );
    }

    const token = await getOptionalAccessToken(userId);

    let result;
    try {
        result = await fetchGithubRepoContent(parsed.owner, parsed.repo, {
            branch: parsed.branch,
            token,
        });
    } catch (err) {
        if (err instanceof GithubApiError && err.requiresAuth && !token) {
            throw new ValidationError(
                `${err.message} Click "Connect GitHub" to authenticate.`,
            );
        }
        throw err instanceof GithubApiError
            ? new ValidationError(err.message)
            : err;
    }

    const sourceTitle = title?.trim() || result.repoInfo.fullName;

    const source = await createAndProcessSource({
        workspaceId,
        type: "GITHUB_REPO",
        title: sourceTitle,
        content: result.markdown,
        url: result.repoInfo.htmlUrl,
        status: "PENDING",
        metadata: {
            owner: parsed.owner,
            repo: parsed.repo,
            branch: parsed.branch || result.repoInfo.defaultBranch,
            fileCount: result.files.length,
            isPrivate: result.repoInfo.isPrivate,
            importedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
    });

    return source;
}
