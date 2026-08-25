import { getWorkspaceByIdForUser } from "./workspace.services.js";
import { assertCanCreateSource } from "./usage.services.js";
import { createAndProcessSource } from "./source.services.js";
import {
    findArtifactByIdAndWorkspaceId,
    updateArtifactRecord,
} from "../repository/artifact.repository.js";
import {
    findConnectedAccount,
    upsertConnectedAccountRecord,
} from "../repository/integration.repository.js";

import { NotFoundError, ValidationError } from "../types/app-error.js";
import type { Prisma } from "../generated/prisma/client.js";

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || "";
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET || "";
const NOTION_REDIRECT_URI =
    process.env.NOTION_REDIRECT_URI ||
    "http://localhost:8081/api/integrations/notion/callback";

const NOTION_API_VERSION = "2022-06-28";

/**
 * Generates the Notion OAuth 2.0 authorization URL for connecting a Notion workspace.
 *
 * @param userId - Unique identifier of the user (passed in state parameter)
 * @returns Notion OAuth consent URL
 * @throws {ValidationError} When Notion Client ID is not configured
 */
export function getNotionAuthUrl(userId: string): string {
    if (!NOTION_CLIENT_ID) {
        throw new ValidationError("Notion Client ID is not configured on the server.");
    }

    const params = new URLSearchParams({
        client_id: NOTION_CLIENT_ID,
        redirect_uri: NOTION_REDIRECT_URI,
        response_type: "code",
        owner: "user",
        state: userId,
    });

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
}

/**
 * Connects a Notion workspace directly using an internal Notion integration secret token.
 *
 * @param params - Configuration object
 * @param params.userId - Authenticated user's identifier
 * @param params.token - Notion internal integration token
 * @returns ConnectedAccount record for the authenticated user
 * @throws {ValidationError} When token is invalid or lacks access to user profile
 */
export async function connectNotionWithToken({
    userId,
    token,
}: {
    userId: string;
    token: string;
}) {
    if (!token || !token.trim()) {
        throw new ValidationError("Notion Integration Token is required.");
    }

    // Verify token by querying Notion bot user
    const userRes = await fetch("https://api.notion.com/v1/users/me", {
        headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Notion-Version": NOTION_API_VERSION,
        },
    });

    if (!userRes.ok) {
        throw new ValidationError("Invalid Notion token or bot has no workspace access.");
    }

    const userData = (await userRes.json()) as {
        name?: string;
        id?: string;
        avatar_url?: string;
    };
    const workspaceName = userData.name || "Connected Notion Workspace";

    const account = await upsertConnectedAccountRecord({
        userId,
        provider: "NOTION",
        accessToken: token.trim(),
        metadata: {
            workspaceName,
            botId: userData.id || null,
            avatarUrl: userData.avatar_url || null,
        },
    });

    return account;
}

/**
 * Exchanges a Notion OAuth authorization code for a bot access token and persists the account.
 *
 * @param params - Callback payload
 * @param params.code - Authorization code returned from Notion OAuth redirect
 * @param params.userId - Authenticated user's identifier
 * @returns The created or updated ConnectedAccount record
 * @throws {ValidationError} If code is missing or token exchange fails
 */
export async function handleNotionOAuthCallback({
    code,
    userId,
}: {
    code: string;
    userId: string;
}) {
    if (!code) {
        throw new ValidationError("Authorization code is missing.");
    }

    const authHeader = Buffer.from(
        `${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: NOTION_REDIRECT_URI,
        }),
    });

    if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Notion token exchange error:", errText);
        throw new ValidationError("Failed to exchange Notion authorization code.");
    }

    const tokenData = (await tokenRes.json()) as {
        access_token: string;
        workspace_name?: string;
        workspace_icon?: string;
        workspace_id?: string;
    };
    const { access_token, workspace_name, workspace_icon, workspace_id } =
        tokenData;

    const account = await upsertConnectedAccountRecord({
        userId,
        provider: "NOTION",
        accessToken: access_token,
        metadata: {
            workspaceName: workspace_name || "Notion Workspace",
            workspaceIcon: workspace_icon || null,
            workspaceId: workspace_id,
        },
    });

    return account;
}

/**
 * Retrieves the stored Notion integration access token for the given user.
 *
 * @param userId - Authenticated user's identifier
 * @returns Valid Notion access token string
 * @throws {NotFoundError} If Notion is not connected for the user
 */
async function getNotionToken(userId: string): Promise<string> {
    const account = await findConnectedAccount(userId, "NOTION");

    if (!account) {
        throw new NotFoundError("Notion is not connected. Please connect your Notion workspace first.");
    }

    return account.accessToken;
}

/**
 * Searches and lists accessible Notion pages and databases in the user's connected workspace.
 *
 * @param userId - Authenticated user's identifier
 * @param search - Optional query string to filter Notion pages
 * @returns Array of page summary objects with title, icon, and URL
 * @throws {ValidationError} If searching Notion API fails
 */
export async function listNotionPages(userId: string, search?: string) {
    const token = await getNotionToken(userId);

    const body: Record<string, unknown> = {
        page_size: 30,
        sort: {
            direction: "descending",
            timestamp: "last_edited_time",
        },
    };

    if (search && search.trim()) {
        body.query = search.trim();
    }

    const res = await fetch("https://api.notion.com/v1/search", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": NOTION_API_VERSION,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Notion search error:", err);
        throw new ValidationError("Failed to fetch Notion pages.");
    }

    const data = (await res.json()) as {
        results?: Array<Record<string, unknown>>;
    };
    const results = (data.results || []) as Array<Record<string, unknown>>;

    const pages = results.map((item) => {
        let title = "Untitled Notion Page";
        const icon = item.icon as Record<string, unknown> | null;
        let emojiIcon: string | null = null;
        if (icon && icon.type === "emoji") {
            emojiIcon = icon.emoji as string;
        }

        // Extract title from properties
        const props = (item.properties as Record<string, unknown>) || {};
        for (const key of Object.keys(props)) {
            const prop = props[key] as Record<string, unknown>;
            if (prop.type === "title" && Array.isArray(prop.title)) {
                const textArr = prop.title.map(
                    (t: Record<string, unknown>) => t.plain_text,
                );
                if (textArr.length > 0) {
                    title = textArr.join("");
                }
                break;
            }
        }

        return {
            id: item.id as string,
            object: item.object as string,
            title,
            icon: emojiIcon,
            url: item.url as string,
            lastEditedTime: item.last_edited_time as string,
        };
    });

    return { pages };
}

/**
 * Converts a Notion rich text array into a formatted Markdown string, preserving bold, italics, and code styles.
 *
 * @param richTextArr - Array of Notion rich text segment objects
 * @returns Formatted markdown string
 */
function extractRichText(richTextArr: Array<Record<string, unknown>>): string {
    if (!Array.isArray(richTextArr)) return "";
    return richTextArr
        .map((rt) => {
            const text = (rt.plain_text as string) || "";
            const annotations = (rt.annotations as Record<string, boolean>) || {};
            let formatted = text;
            if (annotations.bold) formatted = `**${formatted}**`;
            if (annotations.italic) formatted = `*${formatted}*`;
            if (annotations.code) formatted = `\`${formatted}\``;
            return formatted;
        })
        .join("");
}

/**
 * Fetches all block children of a Notion page recursively up to depth 3 and converts them to Markdown syntax.
 *
 * @param pageId - Notion block/page identifier
 * @param token - Valid Notion access token
 * @param depth - Current recursion depth (capped at 3 to prevent loops)
 * @returns Markdown string representation of the page content
 */
async function fetchPageBlocksAsMarkdown(
    pageId: string,
    token: string,
    depth = 0,
): Promise<string> {
    if (depth > 3) return ""; // prevent excessive nesting

    const res = await fetch(
        `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Notion-Version": NOTION_API_VERSION,
            },
        },
    );

    if (!res.ok) {
        return "";
    }

    const data = (await res.json()) as {
        results?: Array<Record<string, unknown>>;
    };
    const blocks = (data.results || []) as Array<Record<string, unknown>>;
    const lines: string[] = [];

    for (const block of blocks) {
        const type = block.type as string;
        const blockContent = block[type] as Record<string, unknown>;

        if (!blockContent) continue;

        const richText = (blockContent.rich_text as Array<Record<string, unknown>>) || [];
        const text = extractRichText(richText);

        switch (type) {
            case "paragraph":
                if (text) lines.push(`${text}\n`);
                break;
            case "heading_1":
                lines.push(`\n# ${text}\n`);
                break;
            case "heading_2":
                lines.push(`\n## ${text}\n`);
                break;
            case "heading_3":
                lines.push(`\n### ${text}\n`);
                break;
            case "bulleted_list_item":
                lines.push(`* ${text}`);
                break;
            case "numbered_list_item":
                lines.push(`1. ${text}`);
                break;
            case "to_do": {
                const checked = blockContent.checked ? "[x]" : "[ ]";
                lines.push(`- ${checked} ${text}`);
                break;
            }
            case "toggle":
                lines.push(`\n**${text}**`);
                break;
            case "quote":
                lines.push(`> ${text}\n`);
                break;
            case "code": {
                const lang = (blockContent.language as string) || "";
                lines.push(`\n\`\`\`${lang}\n${text}\n\`\`\`\n`);
                break;
            }
            case "callout":
                lines.push(`> 💡 **Note:** ${text}\n`);
                break;
            case "divider":
                lines.push("\n---\n");
                break;
            default:
                if (text) lines.push(text);
        }

        // If block has children, fetch recursively
        if (block.has_children) {
            const childMarkdown = await fetchPageBlocksAsMarkdown(
                block.id as string,
                token,
                depth + 1,
            );
            if (childMarkdown) {
                lines.push(childMarkdown);
            }
        }
    }

    return lines.join("\n");
}

/**
 * Imports a Notion page directly as a workspace Source by converting its block structure into markdown.
 *
 * @param params - Ingestion parameters
 * @param params.workspaceId - Target workspace identifier
 * @param params.userId - Authenticated user's identifier
 * @param params.pageId - Notion page identifier
 * @returns The created and enqueued Source record
 * @throws {NotFoundError} If the Notion page is not found
 * @throws {ValidationError} If the page has no readable text content
 */
export async function importNotionPage({
    workspaceId,
    userId,
    pageId,
}: {
    workspaceId: string;
    userId: string;
    pageId: string;
}) {
    // 1. Verify workspace access and quota
    await getWorkspaceByIdForUser(workspaceId, userId);
    await assertCanCreateSource(userId);

    const token = await getNotionToken(userId);

    // 2. Fetch page metadata
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": NOTION_API_VERSION,
        },
    });

    if (!pageRes.ok) {
        throw new NotFoundError("Notion page not found or inaccessible.");
    }

    const pageData = (await pageRes.json()) as {
        properties?: Record<string, unknown>;
        url?: string;
    };
    let title = "Notion Page";

    const props = (pageData.properties as Record<string, unknown>) || {};
    for (const key of Object.keys(props)) {
        const prop = props[key] as Record<string, unknown>;
        if (prop.type === "title" && Array.isArray(prop.title)) {
            const textArr = prop.title.map(
                (t: Record<string, unknown>) => t.plain_text,
            );
            if (textArr.length > 0) {
                title = textArr.join("");
            }
            break;
        }
    }

    // 3. Fetch all block children as markdown
    const markdownContent = await fetchPageBlocksAsMarkdown(pageId, token);

    if (!markdownContent || !markdownContent.trim()) {
        throw new ValidationError("No text content found in the selected Notion page.");
    }

    // 4. Ingest as a Source
    const source = await createAndProcessSource({
        workspaceId,
        type: "NOTION_PAGE",
        title,
        content: markdownContent.trim(),
        url: pageData.url as string,
        status: "PENDING",
        metadata: {
            notionPageId: pageId,
            importedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
    });

    return source;
}

/**
 * Parses markdown text into Notion block representations (headings, lists, quotes, paragraphs).
 *
 * @param text - Markdown content to convert
 * @returns Array of Notion block payload objects
 */
function markdownToNotionBlocks(text: string): Array<Record<string, unknown>> {
    const lines = text.split("\n");
    const blocks: Array<Record<string, unknown>> = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line.startsWith("# ")) {
            blocks.push({
                object: "block",
                type: "heading_1",
                heading_1: {
                    rich_text: [{ type: "text", text: { content: line.slice(2).trim() } }],
                },
            });
        } else if (line.startsWith("## ")) {
            blocks.push({
                object: "block",
                type: "heading_2",
                heading_2: {
                    rich_text: [{ type: "text", text: { content: line.slice(3).trim() } }],
                },
            });
        } else if (line.startsWith("### ")) {
            blocks.push({
                object: "block",
                type: "heading_3",
                heading_3: {
                    rich_text: [{ type: "text", text: { content: line.slice(4).trim() } }],
                },
            });
        } else if (line.startsWith("* ") || line.startsWith("- ")) {
            blocks.push({
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: {
                    rich_text: [{ type: "text", text: { content: line.slice(2).trim() } }],
                },
            });
        } else if (/^\d+\.\s/.test(line)) {
            blocks.push({
                object: "block",
                type: "numbered_list_item",
                numbered_list_item: {
                    rich_text: [{ type: "text", text: { content: line.replace(/^\d+\.\s/, "").trim() } }],
                },
            });
        } else if (line.startsWith("> ")) {
            blocks.push({
                object: "block",
                type: "quote",
                quote: {
                    rich_text: [{ type: "text", text: { content: line.slice(2).trim() } }],
                },
            });
        } else {
            const chunk = line.slice(0, 2000);
            blocks.push({
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [{ type: "text", text: { content: chunk } }],
                },
            });
        }
    }

    return blocks.slice(0, 95);
}

/**
 * Exports a generated learning artifact (summary, quiz, flashcards, report) to Notion as a formatted page.
 *
 * @param params - Export options
 * @param params.workspaceId - Source workspace identifier
 * @param params.artifactId - Artifact identifier to export
 * @param params.userId - Authenticated user's identifier
 * @param params.parentPageId - Optional target Notion parent page identifier
 * @returns Result object with created pageId, Notion web URL, and artifact title
 * @throws {NotFoundError} If artifact is not found
 * @throws {ValidationError} If export fails or no accessible parent pages exist
 */
export async function exportArtifactToNotion({
    workspaceId,
    artifactId,
    userId,
    parentPageId,
}: {
    workspaceId: string;
    artifactId: string;
    userId: string;
    parentPageId?: string;
}) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    const token = await getNotionToken(userId);

    const artifact = await findArtifactByIdAndWorkspaceId(
        artifactId,
        workspaceId,
    );
    if (!artifact) {
        throw new NotFoundError("Artifact not found.");
    }

    const content = (artifact.content as Record<string, unknown>) || {};
    let textToExport = "";

    if (content.markdown) {
        textToExport = String(content.markdown);
    } else if (Array.isArray(content.items)) {
        textToExport = content.items.map((it) => `- ${it}`).join("\n");
    } else if (Array.isArray(content.cards)) {
        textToExport = content.cards
            .map(
                (c: Record<string, string>, i: number) =>
                    `### Card ${i + 1}: ${c.front}\n> **Answer:** ${c.back}\n`,
            )
            .join("\n");
    } else if (Array.isArray(content.questions)) {
        textToExport = content.questions
            .map(
                (q: Record<string, unknown>, i: number) =>
                    `### Q${i + 1}: ${q.question}\n${(q.options as string[]).map((o, idx) => `* Option ${idx + 1}: ${o}`).join("\n")}\n\n> **Correct:** ${(q.options as string[])[q.correctIndex as number]}\n> *Explanation:* ${q.explanation}\n`,
            )
            .join("\n");
    } else {
        textToExport = `Artifact created by OpenBook AI.`;
    }

    const childrenBlocks: Array<Record<string, unknown>> = [
        {
            object: "block",
            type: "callout",
            callout: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: `⚡ Synthesized by OpenBook AI · Artifact Type: ${artifact.type}`,
                        },
                    },
                ],
                icon: { type: "emoji", emoji: "📚" },
            },
        },
        ...markdownToNotionBlocks(textToExport),
    ];

    let targetParent: Record<string, unknown> = {};
    if (parentPageId) {
        targetParent = { page_id: parentPageId };
    } else {
        const pagesList = await listNotionPages(userId);
        if (pagesList.pages.length > 0) {
            targetParent = { page_id: pagesList.pages[0].id };
        } else {
            throw new ValidationError("No accessible Notion pages found. Please invite your Notion integration to at least one page.");
        }
    }

    const createRes = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": NOTION_API_VERSION,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            parent: targetParent,
            properties: {
                title: {
                    title: [
                        {
                            type: "text",
                            text: { content: artifact.title || "OpenBook Synthesis" },
                        },
                    ],
                },
            },
            icon: { type: "emoji", emoji: "📖" },
            children: childrenBlocks,
        }),
    });

    if (!createRes.ok) {
        const errText = await createRes.text();
        console.error("Notion create page error:", errText);
        throw new ValidationError("Failed to create page in Notion.");
    }

    const createdPage = (await createRes.json()) as {
        id: string;
        url: string;
    };

    // Save Notion export metadata to artifact record
    const existingMeta = (artifact.metadata as Record<string, unknown>) || {};
    await updateArtifactRecord(artifactId, {
        metadata: {
            ...existingMeta,
            notionPageUrl: createdPage.url,
            notionPageId: createdPage.id,
            notionExportedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
    });

    return {
        success: true,
        pageId: createdPage.id,
        url: createdPage.url,
        title: artifact.title,
    };
}
