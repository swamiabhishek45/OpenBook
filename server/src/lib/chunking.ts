export type TextChunk = {
    index: number;
    content: string;
    metadata?: Record<string, unknown>;
};

/** Default maximum characters per chunk when no option is passed. */
const DEFAULT_CHUNK_SIZE = 1000;

/** Default overlap between consecutive chunks (helps preserve context at boundaries). */
const DEFAULT_CHUNK_OVERLAP = 100;

const SEPARATORS = ["\n\n", "\n", ". ", " ", ""];

/**
 * Splits raw text into clean chunk strings using recursive hierarchical separators (\n\n, \n, sentence, word).
 *
 * @param text - Raw source text to split
 * @param chunkSize - Maximum character length per chunk
 * @param chunkOverlap - Character overlap between consecutive chunks
 * @returns Array of chunk text strings
 */
function splitText(text: string, chunkSize: number, chunkOverlap: number): string[] {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (trimmed.length <= chunkSize) return [trimmed];

    let separator = "";
    for (const s of SEPARATORS) {
        if (s === "") {
            separator = "";
            break;
        }
        if (trimmed.includes(s)) {
            separator = s;
            break;
        }
    }

    const docs: string[] = [];

    if (separator) {
        const splits = trimmed.split(separator).filter(Boolean);
        let currentDoc: string[] = [];
        let currentLen = 0;

        for (const piece of splits) {
            const pieceLen = piece.length;
            const sepLen = currentDoc.length > 0 ? separator.length : 0;

            if (currentLen + sepLen + pieceLen > chunkSize && currentDoc.length > 0) {
                const joined = currentDoc.join(separator).trim();
                if (joined) docs.push(joined);
                currentDoc = [];
                currentLen = 0;
            }

            if (pieceLen > chunkSize) {
                if (currentDoc.length > 0) {
                    const joined = currentDoc.join(separator).trim();
                    if (joined) docs.push(joined);
                    currentDoc = [];
                    currentLen = 0;
                }
                const subChunks = splitText(piece, chunkSize, chunkOverlap);
                docs.push(...subChunks);
            } else {
                currentDoc.push(piece);
                currentLen += pieceLen + (currentDoc.length > 1 ? separator.length : 0);
            }
        }

        if (currentDoc.length > 0) {
            const joined = currentDoc.join(separator).trim();
            if (joined) docs.push(joined);
        }
    } else {
        const step = Math.max(1, chunkSize - chunkOverlap);
        for (let i = 0; i < trimmed.length; i += step) {
            const slice = trimmed.slice(i, i + chunkSize).trim();
            if (slice) docs.push(slice);
        }
    }

    return docs.filter((chunk) => chunk.trim().length > 0);
}

/**
 * Splits plain text into indexed and token-aware `TextChunk` records with metadata.
 *
 * @param text - Text content to chunk
 * @param options - Configurable chunkSize (default 1000), chunkOverlap (default 100), and custom metadata
 * @returns Array of sequential TextChunk objects
 */
export function chunkText(
    text: string,
    options: {
        chunkSize?: number;
        chunkOverlap?: number;
        metadata?: Record<string, unknown>;
    } = {},
): TextChunk[] {
    const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
    const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;
    const parts = splitText(text, chunkSize, chunkOverlap);

    return parts.map((content, index) => ({
        index,
        content,
        metadata: options.metadata,
    }));
}

/**
 * Splits a multi-page document (e.g. PDF) into chunks while preserving 1-based page numbers in metadata.
 *
 * @param pages - Array of extracted page text strings
 * @param options - Configurable chunkSize and chunkOverlap
 * @returns Array of sequential TextChunk objects tagged with page numbers
 */
export function chunkPages(
    pages: string[],
    options: {
        chunkSize?: number;
        chunkOverlap?: number;
    } = {},
): TextChunk[] {
    const chunks: TextChunk[] = [];
    let index = 0;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const pageText = pages[pageIndex]?.trim();
        if (!pageText) {
            continue;
        }

        const pageChunks = chunkText(pageText, {
            ...options,
            metadata: { page: pageIndex + 1 },
        });

        for (const chunk of pageChunks) {
            chunks.push({
                index,
                content: chunk.content,
                metadata: chunk.metadata,
            });
            index += 1;
        }
    }

    return chunks;
}