export const authRoutes = {
    login: "/login",
    signup: "/signup",
    dashboard: "/dashboard",
    home: "/",
} as const;

export const protectedRoutes = [
    authRoutes.dashboard,
    "/workspace",
] as const;

export const unauthenticatedRoutes = [
    authRoutes.login,
    authRoutes.signup,
] as const;

export function isProtectedRoute(pathname: string) {
    return protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
}

export function isUnauthenticatedRoute(pathname: string) {
    return unauthenticatedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
}
