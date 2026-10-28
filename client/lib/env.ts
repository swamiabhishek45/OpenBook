function requireUrl(name: string, value: string | undefined, fallback?: string): string {
    const resolved = value?.trim() || fallback;
    if (!resolved) {
        throw new Error(`${name} is required (see client/.env.example)`);
    }
    try {
        new URL(resolved);
    } catch {
        throw new Error(`${name} must be a valid URL`);
    }
    return resolved.replace(/\/$/, "");
}

export type ClientEnv = {
    apiUrl: string;
    authUrl: string;
};

let cached: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
    if (cached) return cached;

    const apiUrl = requireUrl(
        "NEXT_PUBLIC_API_URL",
        process.env.NEXT_PUBLIC_API_URL,
        "http://localhost:8081",
    );
    const authUrl = requireUrl(
        "NEXT_PUBLIC_BETTER_AUTH_URL",
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
        apiUrl,
    );

    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL must be set in production");
    }

    cached = { apiUrl, authUrl };
    return cached;
}
