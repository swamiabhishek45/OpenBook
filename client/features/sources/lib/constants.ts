import type { SourceStatus, SourceType } from "./types";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
    PDF: "PDF",
    WEBSITE: "Website",
    YOUTUBE: "YouTube",
    TEXT: "Text",
    MARKDOWN: "Markdown",
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
];

export const SOURCE_STATUSES: SourceStatus[] = [
    "PENDING",
    "PROCESSING",
    "READY",
    "FAILED",
];
