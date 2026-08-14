import { unauth } from "@/features/auth/lib/unauth";

export default async function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await unauth();
  return <>{children}</>;
}
