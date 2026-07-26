import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key — bypasses Storage
 * RLS entirely, same trust model this app already uses for Postgres (Prisma
 * also bypasses RLS; access is enforced in the repository/action layer).
 * Never import this from a client component.
 */
export function createSupabaseServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
