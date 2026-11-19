import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "../lib/db.js";
import { getServerEnv } from "../config/env.js";

export type HealthChecks = {
    database: "ok" | "error";
    pinecone: "ok" | "error" | "skipped";
};

const CHECK_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("health check timed out")), ms),
        ),
    ]);
}

export async function runHealthChecks(): Promise<{
    ok: boolean;
    checks: HealthChecks;
}> {
    const checks: HealthChecks = {
        database: "ok",
        pinecone: "skipped",
    };

    try {
        await withTimeout(prisma.$queryRaw`SELECT 1`, CHECK_TIMEOUT_MS);
    } catch {
        checks.database = "error";
    }

    const env = getServerEnv();
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = env.PINECONE_INDEX ?? process.env.PINECONE_INDEX;

    if (apiKey && indexName && !apiKey.startsWith("your_")) {
        checks.pinecone = "ok";
        try {
            const client = new Pinecone({ apiKey });
            await withTimeout(
                client.describeIndex(indexName),
                CHECK_TIMEOUT_MS,
            );
        } catch {
            checks.pinecone = "error";
        }
    }

    const ok =
        checks.database === "ok" &&
        (checks.pinecone === "ok" || checks.pinecone === "skipped");

    return { ok, checks };
}
