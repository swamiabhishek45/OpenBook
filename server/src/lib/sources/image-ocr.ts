import OpenAI from "openai";
import { OCR_VISION_MODEL } from "../ai-config.js";
import { getSignedCloudinaryDownloadUrl } from "../cloudinary.js";

let client: OpenAI | null = null;

function getClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    return client;
}

const OCR_INSTRUCTIONS = `You extract information from images for a research notebook used in Q&A.

Return plain text (markdown lists/headings allowed).
- Transcribe all readable text verbatim, preserving structure.
- For charts, diagrams, slides, or UI screenshots, describe labels, axes, and relationships clearly.
- For photos with little text, describe subjects and details someone might ask about.
- Do not wrap the answer in code fences.`;

export type ImageOcrResult = {
    text: string;
    model: string;
};

async function runVisionOcr(imageUrl: string): Promise<ImageOcrResult> {
    const response = await getClient().chat.completions.create({
        model: OCR_VISION_MODEL,
        temperature: 0.1,
        max_tokens: 4096,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: OCR_INSTRUCTIONS },
                    {
                        type: "image_url",
                        image_url: { url: imageUrl, detail: "high" },
                    },
                ],
            },
        ],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";

    if (!text) {
        throw new Error("No text or description could be extracted from the image");
    }

    return { text, model: OCR_VISION_MODEL };
}

/**
 * OCR / describe an image from an in-memory buffer (data URL sent to OpenAI Vision).
 */
export async function extractTextFromImageBuffer(
    buffer: Buffer,
    mimeType: string,
): Promise<ImageOcrResult> {
    const normalizedMime =
        mimeType?.startsWith("image/") ? mimeType : "image/jpeg";
    const dataUrl = `data:${normalizedMime};base64,${buffer.toString("base64")}`;
    return runVisionOcr(dataUrl);
}

async function downloadImage(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image (${response.status})`);
    }
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType };
}

/**
 * Downloads an image from Cloudinary (with signed URL fallback) and runs vision OCR.
 */
export async function extractTextFromCloudinaryImage(input: {
    fileUrl: string;
    publicId?: string;
    mimeType?: string;
}): Promise<ImageOcrResult> {
    try {
        const { buffer, contentType } = await downloadImage(input.fileUrl);
        return extractTextFromImageBuffer(
            buffer,
            input.mimeType ?? contentType,
        );
    } catch (error) {
        const isUnauthorized =
            error instanceof Error && error.message.includes("(401)");

        if (!isUnauthorized || !input.publicId) {
            throw error;
        }

        const signedUrl = getSignedCloudinaryDownloadUrl(
            input.publicId,
            "image",
        );

        if (!signedUrl) {
            throw new Error(
                "Image download requires authentication. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or re-upload the image.",
            );
        }

        const { buffer, contentType } = await downloadImage(signedUrl);
        return extractTextFromImageBuffer(
            buffer,
            input.mimeType ?? contentType,
        );
    }
}
