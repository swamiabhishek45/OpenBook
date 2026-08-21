
import { v2 as cloudinary } from "cloudinary";
import { ValidationError } from "../types/app-error.js";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? "swamiabhishek45";
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

/** Normalized result returned after a successful Cloudinary upload. */
export type CloudinaryUploadResult = {
    secureUrl: string;
    publicId: string;
    bytes: number;
    originalFilename: string;
    resourceType: "raw" | "image";
};

type CloudinaryUploadResponse = {
    secure_url: string;
    public_id: string;
    bytes: number;
    resource_type?: string;
    error?: { message: string };
};

export function getSignedCloudinaryDownloadUrl(
    publicId: string,
    resourceType: "raw" | "image" = "raw",
) {
    if (!cloudName || !apiKey || !apiSecret) {
        return null;
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    return cloudinary.url(publicId, {
        resource_type: resourceType,
        type: "upload",
        sign_url: true,
        secure: true,
    });
}

/**
 * Uploads a PDF buffer to Cloudinary.
 * Tries signed upload via SDK first (if API credentials configured),
 * then falls back to unsigned upload preset via REST API.
 *
 * @param buffer - PDF file bytes from Multer
 * @param filename - Original filename (used in the multipart form)
 * @returns Upload metadata including secure URL and public id
 * @throws {ValidationError} When Cloudinary is not configured or upload is rejected
 */
export async function uploadPdfToCloudinary(
    buffer: Buffer,
    filename: string,
): Promise<CloudinaryUploadResult> {
    if (!cloudName) {
        throw new ValidationError("Cloudinary is not configured on the server");
    }

    // 1. Try signed upload if API Key and Secret are properly configured
    if (apiKey && apiSecret && apiKey !== apiSecret) {
        try {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true,
            });

            const base64Data = `data:application/pdf;base64,${buffer.toString("base64")}`;
            const cleanId = filename.replace(/\.[^/.]+$/, "");

            const result = await cloudinary.uploader.upload(base64Data, {
                resource_type: "raw",
                folder: "chaibook/pdfs",
                public_id: cleanId,
            });

            if (result?.secure_url) {
                return {
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes || buffer.length,
                    originalFilename: filename,
                    resourceType: "raw",
                };
            }
        } catch (signedErr) {
            console.warn(
                "Cloudinary signed PDF upload failed, attempting unsigned upload:",
                signedErr,
            );
        }
    }

    // 2. Unsigned upload via fetch with upload preset
    const form = new FormData();
    form.append(
        "file",
        new Blob([new Uint8Array(buffer)], { type: "application/pdf" }),
        filename,
    );
    form.append("upload_preset", uploadPreset);
    form.append("folder", "chaibook/pdfs");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: "POST", body: form },
    );

    const result = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok) {
        const message =
            result.error?.message ??
            `Cloudinary upload failed (${response.status})`;

        if (response.status === 403) {
            throw new ValidationError(
                "Cloudinary rejected the upload. Check CLOUDINARY_UPLOAD_PRESET in server/.env matches an unsigned preset in your dashboard.",
            );
        }

        throw new ValidationError(message);
    }

    return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        originalFilename: filename,
        resourceType: result.resource_type === "image" ? "image" : "raw",
    };
}

/**
 * Uploads an MP3 audio buffer to Cloudinary.
 * Tries signed upload via SDK first (if API credentials configured),
 * then falls back to unsigned upload preset via REST API.
 *
 * @param buffer - MP3 audio file bytes
 * @param filename - Filename for the audio file (e.g. podcast.mp3)
 * @returns Upload result with secure URL
 */
export async function uploadAudioToCloudinary(
    buffer: Buffer,
    filename: string,
): Promise<CloudinaryUploadResult> {
    if (!cloudName) {
        throw new ValidationError("Cloudinary is not configured on the server");
    }

    // 1. Try signed upload if API Key and Secret are properly configured
    if (apiKey && apiSecret && apiKey !== apiSecret) {
        try {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true,
            });

            const base64Data = `data:audio/mp3;base64,${buffer.toString("base64")}`;
            const cleanId = filename.replace(/\.[^/.]+$/, "");

            const result = await cloudinary.uploader.upload(base64Data, {
                resource_type: "video",
                folder: "chaibook/podcasts",
                public_id: cleanId,
                format: "mp3",
            });

            if (result?.secure_url) {
                return {
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes || buffer.length,
                    originalFilename: filename,
                    resourceType: "raw",
                };
            }
        } catch (signedErr) {
            console.warn(
                "Cloudinary signed upload failed, attempting unsigned upload:",
                signedErr,
            );
        }
    }

    // 2. Unsigned upload via fetch with upload preset
    const form = new FormData();
    form.append(
        "file",
        new Blob([new Uint8Array(buffer)], { type: "audio/mpeg" }),
        filename,
    );
    form.append("upload_preset", uploadPreset);
    form.append("folder", "chaibook/podcasts");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: "POST", body: form },
    );

    const result = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok) {
        // Fallback to raw upload if video/upload fails on preset
        const rawResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
            { method: "POST", body: form },
        );
        const rawResult = (await rawResponse.json()) as CloudinaryUploadResponse;
        if (!rawResponse.ok) {
            const message =
                rawResult.error?.message ??
                result.error?.message ??
                `Cloudinary audio upload failed (${response.status})`;
            throw new ValidationError(message);
        }
        return {
            secureUrl: rawResult.secure_url,
            publicId: rawResult.public_id,
            bytes: rawResult.bytes,
            originalFilename: filename,
            resourceType: "raw",
        };
    }

    return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        originalFilename: filename,
        resourceType: "raw",
    };
}