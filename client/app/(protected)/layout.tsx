import { requireAuth } from "@/features/auth/lib/require-auth";

export default async function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
