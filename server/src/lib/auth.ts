import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8081",
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [clientUrl, "http://localhost:3000", "http://localhost:8081"],
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
    }
});