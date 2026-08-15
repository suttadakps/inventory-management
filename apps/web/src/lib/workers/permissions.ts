import type { Role } from "@/lib/auth/roles";

/** Same set as canManageWages — the roster is an operational/site concept,
 * not tax-sensitive like the WHT form itself. */
export function canManageWorkers(role: Role): boolean {
  return (
    role === "owner" ||
    role === "admin" ||
    role === "ae" ||
    role === "site_engineer"
  );
}
