import type { Role } from "@/lib/auth/roles";

/** Same set as canManageBoq — this is BOQ-adjacent reference data. */
export function canManagePriceCatalog(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "ae";
}
