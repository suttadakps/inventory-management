import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isRole, type Role } from "./roles";

/**
 * Session + RBAC helpers for Server Components / Route Handlers.
 * These enforce access on the server — the UI is never the security boundary
 * (docs/03_SYSTEM_ARCHITECTURE.md §6, docs/06_PERMISSION_MATRIX.md §7).
 */

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
};

/** Returns the authenticated user + profile, or null if not signed in. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role: Role = isRole(profile?.role) ? profile.role : "client";

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    role,
  };
}

/** Requires a signed-in user; redirects to /login otherwise. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Requires the user to hold one of `allowed` roles; sends them back to the
 * dashboard otherwise. Extend with a proper 403 page when modules land.
 */
export async function requireRole(allowed: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) redirect("/dashboard");
  return user;
}
