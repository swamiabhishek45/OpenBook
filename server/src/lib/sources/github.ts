const SKIP_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    "__pycache__",
    ".venv",
    "vendor",
    ".turbo",
    ".cache",
    "target",
    "bin",
    "obj",
]);

const TEXT_EXTENSIONS = new Set([
    ".md",
    ".txt",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".css",
    ".scss",
    ".html",
    ".htm",
    ".sql",
    ".rs",
    ".go",
    ".java",
    ".rb",
    ".php",
    ".swift",
    ".kt",
    ".vue",
    ".svelte",
    ".sh",
    ".bash",
    ".zsh",
    ".graphql",
    ".prisma",
    ".env.example",
    ".dockerfile",
    ".xml",
    ".csv",
    ".r",
    ".lua",
    ".dart",
    ".ex",
    ".exs",
    ".clj",
    ".hs",
    ".elm",
    ".tf",
    ".hcl",
]);

const SKIP_FILES = new Set([
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "Cargo.lock",
    "Gemfile.lock",
    "poetry.lock",
    "composer.lock",
]);

export const GITHUB_MAX_FILES = 150;
export const GITHUB_MAX_TOTAL_BYTES = 4 * 1024 * 1024;
export const GITHUB_MAX_FILE_SIZE = 500 * 1024;

export interface ParsedGithubRepo {
    owner: string;
    repo: string;
    branch?: string;
}

/**
 * Parses a GitHub repository URL into owner, repo, and optional branch.
 */
export function parseGithubRepoUrl(input: string): ParsedGithubRepo | null {
    const trimmed = input.trim();

    try {
        const url = new URL(trimmed);
        if (!["github.com", "www.github.com"].includes(url.hostname)) {
            return null;
        }

        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length < 2) {
            return null;
        }

        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/, "");

        let branch: string | undefined;
        if (parts[2] === "tree" && parts[3]) {
            branch = parts[3];
        }

        return { owner, repo, branch };
    } catch {
        const shorthand = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
        if (shorthand) {
            return { owner: shorthand[1], repo: shorthand[2] };
        }
        return null;
    }
}

function shouldIncludeFile(path: string, size?: number): boolean {
    const segments = path.split("/");
    if (segments.some((segment) => SKIP_DIRS.has(segment))) {
        return false;
    }

    const filename = segments[segments.length - 1] || path;
    if (SKIP_FILES.has(filename)) {
        return false;
    }

    if (size !== undefined && size > GITHUB_MAX_FILE_SIZE) {
        return false;
    }

    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex === -1) {
        return filename === "Dockerfile" || filename === "Makefile" || filename === "LICENSE";
    }

    const ext = filename.slice(dotIndex).toLowerCase();
    return TEXT_EXTENSIONS.has(ext);
}

export interface GithubTreeItem {
    path: string;
    sha: string;
    size?: number;
}

export interface GithubRepoInfo {
    fullName: string;
    description: string | null;
    defaultBranch: string;
    htmlUrl: string;
    isPrivate: boolean;
}

export interface GithubFileContent {
    path: string;
    content: string;
}

export class GithubApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public requiresAuth = false,
    ) {
        super(message);
        this.name = "GithubApiError";
    }
}

async function githubApiFetch<T>(
    path: string,
    token?: string,
): Promise<T> {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`https://api.github.com${path}`, { headers });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        const requiresAuth = res.status === 401 || res.status === 403;
        let message = `GitHub API error (${res.status})`;

        if (res.status === 404) {
            message = "Repository not found or you don't have access.";
        } else if (res.status === 403) {
            message = token
                ? "GitHub access denied. The repository may be private or your token lacks permissions."
                : "GitHub rate limit reached or repository is private. Connect your GitHub account to continue.";
        } else if (res.status === 401) {
            message = "GitHub authentication failed. Please reconnect your GitHub account.";
        }

        throw new GithubApiError(message, res.status, requiresAuth);
    }

    return res.json() as Promise<T>;
}

/**
 * Fetches repository metadata from the GitHub API.
 */
export async function fetchGithubRepoInfo(
    owner: string,
    repo: string,
    token?: string,
): Promise<GithubRepoInfo> {
    const data = await githubApiFetch<{
        full_name: string;
        description: string | null;
        default_branch: string;
        html_url: string;
        private: boolean;
    }>(`/repos/${owner}/${repo}`, token);

    return {
        fullName: data.full_name,
        description: data.description,
        defaultBranch: data.default_branch,
        htmlUrl: data.html_url,
        isPrivate: data.private,
    };
}

/**
 * Lists text files in a repository tree, filtered by extension and size.
 */
export async function listGithubRepoFiles(
    owner: string,
    repo: string,
    branch: string,
    token?: string,
): Promise<GithubTreeItem[]> {
    const treeData = await githubApiFetch<{
        tree: Array<{
            path: string;
            type: string;
            sha: string;
            size?: number;
        }>;
        truncated: boolean;
    }>(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, token);

    if (treeData.truncated) {
        console.warn(`GitHub tree for ${owner}/${repo} was truncated; some files may be missing.`);
    }

    return treeData.tree
        .filter((item) => item.type === "blob" && shouldIncludeFile(item.path, item.size))
        .map((item) => ({
            path: item.path,
            sha: item.sha,
            size: item.size,
        }))
        .sort((a, b) => (a.size ?? 0) - (b.size ?? 0))
        .slice(0, GITHUB_MAX_FILES);
}

/**
 * Fetches the decoded text content of a single blob by SHA.
 */
export async function fetchGithubBlobContent(
    owner: string,
    repo: string,
    sha: string,
    token?: string,
): Promise<string> {
    const data = await githubApiFetch<{
        content: string;
        encoding: string;
        size: number;
    }>(`/repos/${owner}/${repo}/git/blobs/${sha}`, token);

    if (data.encoding !== "base64") {
        return "";
    }

    return Buffer.from(data.content, "base64").toString("utf-8");
}

/**
 * Fetches and assembles text content from all readable files in a GitHub repo.
 */
export async function fetchGithubRepoContent(
    owner: string,
    repo: string,
    options: {
        branch?: string;
        token?: string;
    } = {},
): Promise<{
    repoInfo: GithubRepoInfo;
    files: GithubFileContent[];
    markdown: string;
}> {
    const repoInfo = await fetchGithubRepoInfo(owner, repo, options.token);
    const branch = options.branch || repoInfo.defaultBranch;

    if (repoInfo.isPrivate && !options.token) {
        throw new GithubApiError(
            "This is a private repository. Connect your GitHub account to import it.",
            403,
            true,
        );
    }

    const treeItems = await listGithubRepoFiles(owner, repo, branch, options.token);

    if (treeItems.length === 0) {
        throw new GithubApiError(
            "No readable text files found in this repository.",
            422,
        );
    }

    const files: GithubFileContent[] = [];
    let totalBytes = 0;

    for (const item of treeItems) {
        if (totalBytes >= GITHUB_MAX_TOTAL_BYTES) {
            break;
        }

        try {
            const content = await fetchGithubBlobContent(
                owner,
                repo,
                item.sha,
                options.token,
            );

            if (!content.trim()) {
                continue;
            }

            const contentBytes = Buffer.byteLength(content, "utf-8");
            if (totalBytes + contentBytes > GITHUB_MAX_TOTAL_BYTES) {
                continue;
            }

            totalBytes += contentBytes;
            files.push({ path: item.path, content });
        } catch (err) {
            console.warn(`Failed to fetch ${item.path}:`, err);
        }
    }

    if (files.length === 0) {
        throw new GithubApiError(
            "Could not extract readable text from this repository.",
            422,
        );
    }

    const header = [
        `# ${repoInfo.fullName}`,
        repoInfo.description ? `\n${repoInfo.description}` : "",
        `\nBranch: ${branch}`,
        `Files indexed: ${files.length}`,
        "",
        "---",
        "",
    ].join("\n");

    const body = files
        .map((file) => `## File: ${file.path}\n\n${file.content}`)
        .join("\n\n---\n\n");

    return {
        repoInfo,
        files,
        markdown: header + body,
    };
}
