import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

function ipKey(req: Request): string {
    return ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? "unknown");
}

function clientKey(req: Request): string {
    const userId = req.session?.user?.id;
    if (userId) return `user:${userId}`;
    return ipKey(req);
}

/** Broad protection for all JSON API routes. */
export const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKey,
    message: { error: "Too many requests. Please try again later." },
});

/** Stricter limits for ingestion, chat, and artifact generation (mutating methods). */
export const aiOperationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: clientKey,
    skip: (req) => req.method === "GET" || req.method === "HEAD",
    message: {
        error: "AI operation rate limit exceeded. Please wait before retrying.",
    },
});
