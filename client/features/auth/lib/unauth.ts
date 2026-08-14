import { redirect } from "next/navigation";
import { authRoutes } from "./auth-routes";
import { getSession } from "./auth-server";

export async function unauth() {
    const session = await getSession();

    if (session) {
        redirect(authRoutes.dashboard);
    }
}
