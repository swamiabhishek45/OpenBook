import { headers } from "next/headers";
import { authClient } from "./auth-client";

export type Session = typeof authClient.$Infer.Session;

export async function getSession(): Promise<Session | null> {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";

    const baseUrl =
        process.env.BACKEND_INTERNAL_URL ||
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
        process.env.BETTER_AUTH_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8081";

    try {
        const response = await fetch(`${baseUrl}/api/auth/get-session`, {
            headers: { cookie },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as Session | null;
        return data?.user ? data : null;
    } catch {
        return null;
    }
}
