import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Routes reachable without an authenticated session.
 * `/reset-password` is public because the user arrives on it via the recovery
 * link (they hold a short-lived recovery session but must be allowed to land).
 */
const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/forgot-password",
  "/reset-password",
]);

/** Auth pages an already-authenticated user should be bounced away from. */
const AUTHED_REDIRECT_AWAY = new Set<string>(["/login", "/forgot-password"]);

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/auth/") ||
    // Public referral intake for the company website (token-gated in the route).
    pathname.startsWith("/api/referrals")
  );
}

/**
 * Session management (docs/03_SYSTEM_ARCHITECTURE.md §6):
 * - refreshes the Supabase session cookies on every request,
 * - redirects unauthenticated users to /login for protected routes,
 * - redirects authenticated users away from the auth pages.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: getUser() re-validates the token with Supabase (do not trust
  // getSession() alone for authorization decisions).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && AUTHED_REDIRECT_AWAY.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
