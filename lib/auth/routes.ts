/** Routes that require an authenticated Supabase session */
export const PROTECTED_ROUTES = [
  "/bookings",
  "/seat-selection",
  "/booking-confirmation",
  "/dashboard",
  "/my-bookings",
] as const;

/** Auth pages — authenticated users are sent to the dashboard */
export const AUTH_ROUTES = ["/login", "/signup"] as const;

/** Explicit public app routes (no login required) */
export const PUBLIC_ROUTES = ["/", "/flights", "/offline"] as const;

export const AUTH_CALLBACK_PREFIX = "/auth";

export const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard";
export const DEFAULT_UNAUTHENTICATED_REDIRECT = "/login";

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function matchesRoute(pathname: string, route: string): boolean {
  const path = normalizePathname(pathname);

  if (route === "/") {
    return path === "/";
  }

  return path === route || path.startsWith(`${route}/`);
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isAuthCallbackRoute(pathname: string): boolean {
  return normalizePathname(pathname).startsWith(AUTH_CALLBACK_PREFIX);
}

export function shouldBypassAuthMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
  );
}
