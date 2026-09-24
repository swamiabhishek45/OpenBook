import type { ChatCitation } from "./types";

export function getCitationByIndex(
    citations: ChatCitation[],
    index: number,
    kind: "workspace" | "web" = "workspace",
) {
    const match = citations.find((citation) => {
        if (citation.index !== index) {
            return false;
        }
        if (kind === "web") {
            return citation.sourceType === "WEB";
        }
        return citation.sourceType !== "WEB";
    });
    if (match) {
        return match;
    }
    if (kind === "workspace") {
        return citations.filter((c) => c.sourceType !== "WEB")[index - 1] ?? null;
    }
    return null;
}

export function uniqueCitationsBySource(citations: ChatCitation[]) {
    return citations.filter((citation, index, array) => {
        const key = citation.sourceId ?? citation.url ?? citation.sourceTitle;
        return (
            array.findIndex(
                (item) =>
                    (item.sourceId ?? item.url ?? item.sourceTitle) === key,
            ) === index
        );
    });
}
