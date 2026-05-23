import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_AUTHENTICATED_REDIRECT,
  DEFAULT_UNAUTHENTICATED_REDIRECT,
  isAuthRoute,
  isProtectedRoute,
  shouldBypassAuthMiddleware,
} from "@/lib/auth/routes";
import { supabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

function copyCookies(source: NextResponse, target: NextResponse): void {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value);
  });
}

function redirectWithCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
  search = ""
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;

  const redirectResponse = NextResponse.redirect(url);
  copyCookies(supabaseResponse, redirectResponse);
  return redirectResponse;
}

/**
 * Refreshes the Supabase session, enforces route protection, and syncs cookies.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldBypassAuthMiddleware(pathname)) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    supabaseEnv.url,
    supabaseEnv.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Required: refreshes session if expired. Do not add logic between
  // createServerClient and getUser() — can cause random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const redirectPath =
      pathname +
      (request.nextUrl.search ? request.nextUrl.search : "");
    const search = `?redirect=${encodeURIComponent(redirectPath)}`;

    return redirectWithCookies(
      request,
      supabaseResponse,
      DEFAULT_UNAUTHENTICATED_REDIRECT,
      search
    );
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    return redirectWithCookies(
      request,
      supabaseResponse,
      DEFAULT_AUTHENTICATED_REDIRECT
    );
  }

  return supabaseResponse;
}
