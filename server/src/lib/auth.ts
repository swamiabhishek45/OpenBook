import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";

const rawClientUrls = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = rawClientUrls
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production" || process.env.BETTER_AUTH_URL?.startsWith("https://");

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8081",
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        ...allowedOrigins,
        "http://localhost:3000",
        "http://localhost:8081",
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    advanced: {
        defaultCookieAttributes: {
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
            partitioned: true,
        },
    },
});