import type { Role } from "@/lib/auth/roles";

/** Tax documents are more sensitive than routine cost entries, so this is
 * deliberately narrower than canManageCosts (owner/admin/ae/site_engineer). */
export function canManageWht(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "ae";
}
