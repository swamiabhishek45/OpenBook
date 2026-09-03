import type { SourceStatus, SourceType } from "./types";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
    PDF: "PDF",
    WEBSITE: "Website",
    YOUTUBE: "YouTube",
    TEXT: "Text",
    MARKDOWN: "Markdown",
    GOOGLE_DOC: "Google Doc",
    NOTION_PAGE: "Notion Page",
    GITHUB_REPO: "GitHub Repo",
};

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    READY: "Ready",
    FAILED: "Failed",
};

export const SOURCE_TYPES: SourceType[] = [
    "TEXT",
    "MARKDOWN",
    "PDF",
    "WEBSITE",
    "YOUTUBE",
    "GOOGLE_DOC",
    "NOTION_PAGE",
    "GITHUB_REPO",
];


export const SOURCE_STATUSES: SourceStatus[] = [
    "PENDING",
    "PROCESSING",
    "READY",
    "FAILED",
];
