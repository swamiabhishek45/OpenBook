import { CHUNK_SIZE } from "../ai-config.js";

export type LayoutBlockType = "paragraph" | "table" | "heading";

export type LayoutBlock = {
    type: LayoutBlockType;
    content: string;
};

const TABLE_MAX_CHARS = 4000;

function isTableLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) {
        return false;
    }
    if (/^\|?.+\|.+\|/.test(trimmed)) {
        return true;
    }
    const cols = trimmed.split(/\s{2,}/).filter(Boolean);
    return cols.length >= 3;
}

function isHeadingLine(line: string, nextLine?: string): boolean {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 120) {
        return false;
    }
    if (/^#{1,6}\s+/.test(trimmed)) {
        return true;
    }
    if (nextLine && nextLine.trim().length > 0 && trimmed.length < 80) {
        return !trimmed.endsWith(".") && /^[A-Z0-9]/.test(trimmed);
    }
    return false;
}

/**
 * Segments page or document text into layout blocks (tables kept intact).
 */
export function segmentIntoLayoutBlocks(text: string): LayoutBlock[] {
    const lines = text.split("\n");
    const blocks: LayoutBlock[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i] ?? "";

        if (isTableLine(line)) {
            const tableLines: string[] = [];
            while (i < lines.length && isTableLine(lines[i] ?? "")) {
                tableLines.push(lines[i] ?? "");
                i += 1;
            }
            blocks.push({ type: "table", content: tableLines.join("\n").trim() });
            continue;
        }

        if (isHeadingLine(line, lines[i + 1])) {
            blocks.push({ type: "heading", content: line.trim() });
            i += 1;
            continue;
        }

        const paraLines: string[] = [];
        while (
            i < lines.length &&
            (lines[i] ?? "").trim() &&
            !isTableLine(lines[i] ?? "") &&
            !isHeadingLine(lines[i] ?? "", lines[i + 1])
        ) {
            paraLines.push(lines[i] ?? "");
            i += 1;
        }

        if (paraLines.length > 0) {
            blocks.push({
                type: "paragraph",
                content: paraLines.join("\n").trim(),
            });
        } else {
            i += 1;
        }
    }

    return blocks.filter((block) => block.content.length > 0);
}

export function layoutBlockChunkLimit(block: LayoutBlock): number {
    if (block.type === "table") {
        return TABLE_MAX_CHARS;
    }
    return CHUNK_SIZE;
}
