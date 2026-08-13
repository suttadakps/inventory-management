import type { Role } from "@/lib/auth/roles";

/** Same rationale/set as canManageWht — tax filings are sensitive. */
export function canManageVat(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "ae";
}
