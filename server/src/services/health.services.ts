import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "../lib/db.js";
import { getServerEnv } from "../config/env.js";

export type HealthChecks = {
    database: "ok" | "error";
    pinecone: "ok" | "error" | "skipped";
};

export async function runHealthChecks(): Promise<{
    ok: boolean;
    checks: HealthChecks;
}> {
    const checks: HealthChecks = {
        database: "ok",
        pinecone: "skipped",
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
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
            await client.describeIndex(indexName);
        } catch {
            checks.pinecone = "error";
        }
    }

    const ok =
        checks.database === "ok" &&
        (checks.pinecone === "ok" || checks.pinecone === "skipped");

    return { ok, checks };
}
