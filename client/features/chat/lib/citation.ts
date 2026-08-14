import type { ChatCitation } from "./types";

export function getCitationByIndex(
    citations: ChatCitation[],
    index: number,
) {
    return citations[index - 1] ?? null;
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
