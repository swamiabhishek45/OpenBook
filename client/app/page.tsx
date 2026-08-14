import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth-server";
import { authRoutes } from "@/features/auth/lib/auth-routes";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect(authRoutes.dashboard);
  } else {
    redirect(authRoutes.login);
  }
}
