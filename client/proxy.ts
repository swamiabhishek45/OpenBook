import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.headers.get("cookie") ?? "";

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/settings");

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8081";

  try {
    const sessionRes = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });

    const sessionData = await sessionRes.json().catch(() => null);
    const isAuthenticated = Boolean(sessionData?.user);

    if (isProtected && !isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // If backend check fails, allow server layouts to handle gracefully
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
