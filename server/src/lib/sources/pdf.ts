import { extractText, getDocumentProxy } from "unpdf";
import { getSignedCloudinaryDownloadUrl } from "../cloudinary.js";


export type PdfExtractResult = {
    text: string;
    pages: string[];
    pageCount: number;
};


/**
 * Downloads a binary PDF file from a remote HTTP/HTTPS URL into an ArrayBuffer.
 *
 * @param url - Remote PDF asset URL
 * @returns Promise resolving to ArrayBuffer of PDF bytes
 * @throws {Error} When network request fails
 */
async function downloadPdf(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download PDF (${response.status})`);
    }

    return response.arrayBuffer();
}

/**
 * Parses and extracts text content from an in-memory PDF binary buffer using `unpdf`.
 *
 * @param buffer - ArrayBuffer or Node Buffer containing PDF file data
 * @returns Object with concatenated text, array of page-level strings, and total page count
 * @throws {Error} When text cannot be extracted or document contains no readable text
 */
export async function extractPdfFromBuffer(
    buffer: ArrayBuffer | Buffer,
): Promise<PdfExtractResult> {
    const arrayBuffer =
        buffer instanceof Buffer
            ? (buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength,
            ) as ArrayBuffer)
            : buffer;

    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });

    const pages = Array.isArray(text)
        ? text.map((page) => page.trim())
        : [String(text).trim()];

    const joined = pages.filter(Boolean).join("\n\n");

    if (!joined) {
        throw new Error("No text could be extracted from the PDF");
    }

    return {
        text: joined,
        pages,
        pageCount: totalPages,
    };
}

/**
 * Downloads a PDF file from Cloudinary (supporting private signed URL fallbacks) and extracts its textual content.
 *
 * @param input - Object containing fileUrl, optional publicId, and resourceType
 * @returns Promise resolving to parsed PDF text and page arrays
 * @throws {Error} If download fails or authentication is required but missing
 */
export async function extractPdfFromCloudinary(input: {
    fileUrl: string;
    publicId?: string;
    resourceType?: "raw" | "image";
}): Promise<PdfExtractResult> {
    try {
        const buffer = await downloadPdf(input.fileUrl);
        return await extractPdfFromBuffer(buffer);
    } catch (error) {
        const isUnauthorized =
            error instanceof Error && error.message.includes("(401)");

        if (!isUnauthorized || !input.publicId) {
            throw error;
        }

        const signedUrl = getSignedCloudinaryDownloadUrl(
            input.publicId,
            input.resourceType ?? "raw",
        );

        if (!signedUrl) {
            throw new Error(
                "PDF download requires authentication. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, or re-upload the PDF.",
            );
        }

        const buffer = await downloadPdf(signedUrl);
        return extractPdfFromBuffer(buffer);
    }
}