import { redirect } from "next/navigation";
import { authRoutes } from "./auth-routes";
import { getSession, type Session } from "./auth-server";

export async function requireAuth(): Promise<Session> {
    const session = await getSession();

    if (!session) {
        redirect(authRoutes.login);
    }

    return session;
}
