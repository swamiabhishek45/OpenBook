import { z } from "zod";

const placeholderPattern = /^(your_|sk-proj-your|fc-your|tvly-|m0-your|rzp_test_your)/i;

function isPlaceholder(value: string | undefined): boolean {
    if (!value) return true;
    const trimmed = value.trim();
    if (!trimmed) return true;
    return placeholderPattern.test(trimmed);
}

const baseSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().int().positive().default(8081),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    CLIENT_URL: z.string().min(1, "CLIENT_URL is required"),
    SERVER_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z
        .string()
        .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
    BETTER_AUTH_URL: z.string().url().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    PINECONE_API_KEY: z.string().optional(),
    PINECONE_INDEX: z.string().optional(),
    ELEVENLABS_API_KEY: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    FIRECRAWL_API_KEY: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof baseSchema>;

let cached: ServerEnv | null = null;

/** @internal Test helper */
export function resetServerEnvCacheForTests(): void {
    cached = null;
}

/**
 * Validates process.env at startup. Production requires real AI/storage credentials.
 */
export function getServerEnv(): ServerEnv {
    if (cached) return cached;

    const parsed = baseSchema.safeParse(process.env);
    if (!parsed.success) {
        const message = parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("\n");
        throw new Error(`Invalid server environment:\n${message}`);
    }

    cached = parsed.data;

    if (cached.NODE_ENV === "production") {
        const requiredInProd: (keyof ServerEnv)[] = [
            "OPENAI_API_KEY",
            "PINECONE_API_KEY",
            "PINECONE_INDEX",
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
        ];
        const missing = requiredInProd.filter((key) =>
            isPlaceholder(cached![key] as string | undefined),
        );
        if (missing.length > 0) {
            throw new Error(
                `Missing or placeholder production env: ${missing.join(", ")}`,
            );
        }
    } else {
        const optionalWarnings = [
            "OPENAI_API_KEY",
            "PINECONE_API_KEY",
            "GEMINI_API_KEY",
        ] as const;
        for (const key of optionalWarnings) {
            if (isPlaceholder(process.env[key])) {
                console.warn(
                    `[env] ${key} is unset or placeholder — related features may fail.`,
                );
            }
        }
    }

    return cached;
}

/** Call once before the HTTP server listens. */
export function assertServerEnv(): ServerEnv {
    return getServerEnv();
}
