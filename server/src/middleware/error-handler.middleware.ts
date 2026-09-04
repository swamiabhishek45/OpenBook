import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../types/app-error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";

/**
 * Global Express error handling middleware. Formats Application errors, Zod validation failures,
 * Multer upload errors, and Cloudinary permission errors into standardized JSON responses.
 *
 * @param error - Encountered error or exception
 * @param _req - Express request object
 * @param res - Express response object
 * @param _next - Express next function
 */
export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            error: error.message,
            ...(error.details ? { details: error.details } : {}),
        });
        return;
    }

    if (error instanceof ZodError) {
        res.status(400).json({
            error: "Validation failed",
            details: getZodFieldErrors(error),
        });
        return;
    }

    if (error instanceof multer.MulterError) {
        res.status(400).json({ error: error.message });
        return;
    }

    if (error instanceof Error && error.message === "Only PDF files are allowed") {
        res.status(400).json({ error: error.message });
        return;
    }

    const cloudinaryError = error as Error & { http_code?: number; name?: string };
    if (
        cloudinaryError.name === "UnexpectedResponse" &&
        cloudinaryError.http_code === 403
    ) {
        res.status(400).json({
            error:
                "Cloudinary upload rejected: your API key is missing Upload (create) permission. In Cloudinary Dashboard → Settings → API Keys, use the root secret or create a key with Upload enabled.",
        });
        return;
    }

    if (error instanceof Error) {
        const message = error.message;

        if (
            message.includes("IntegrationProvider") ||
            message.includes("invalid input value for enum")
        ) {
            res.status(500).json({
                error:
                    "Database is missing GitHub integration support. Run: ALTER TYPE \"IntegrationProvider\" ADD VALUE IF NOT EXISTS 'GITHUB';",
            });
            return;
        }
    }

    console.error(error);
    res.status(500).json({ error: "Internal server error" });
}