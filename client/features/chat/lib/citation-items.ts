import type { CitationItem } from "@/components/agents/citations";
import { uniqueCitationsBySource } from "./citation";
import type { ChatCitation } from "./types";

export function chatCitationsToAgentItems(
  citations?: ChatCitation[] | null,
): CitationItem[] {
  if (!citations?.length) return [];

  const unique = uniqueCitationsBySource(citations);

  return unique.map((citation, index) => ({
    id: citation.chunkId ?? citation.sourceId ?? `citation-${index}`,
    title: citation.sourceTitle,
    domain: citation.sourceType,
    url: citation.url,
    snippet: citation.excerpt,
  }));
}
