/**
 * Prisma client for the web app.
 *
 * Re-exported from the shared @artiverges/database package (single schema,
 * single client). Prisma connects as the database owner and therefore
 * BYPASSES Supabase RLS — all authorization for data accessed through Prisma
 * must be enforced in the application layer (see src/lib/projects/permissions.ts
 * and the repositories), per docs/03_SYSTEM_ARCHITECTURE.md §6.
 */
export { prisma } from "@artiverges/database";
