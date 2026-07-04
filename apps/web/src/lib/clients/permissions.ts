import type { Role } from "@/lib/auth/roles";

/**
 * Clients-module access rules (docs/06_PERMISSION_MATRIX.md §5).
 * Enforced in the app layer because Prisma bypasses RLS.
 *
 * - View (list/detail): owner, admin, ae, site_engineer.
 * - Create / Edit: owner, admin, ae.
 * - Archive/Restore: owner, admin.
 *
 * Note: the matrix grants a `client` role self-view of its own record; that is
 * delivered through the future Client Portal, not this internal CRM module.
 * `worker` has no access here.
 */

const VIEWERS: readonly Role[] = ["owner", "admin", "ae", "site_engineer"];
const MANAGERS: readonly Role[] = ["owner", "admin", "ae"];
const ARCHIVERS: readonly Role[] = ["owner", "admin"];

export function canViewClients(role: Role): boolean {
  return VIEWERS.includes(role);
}

export function canManageClients(role: Role): boolean {
  return MANAGERS.includes(role);
}

export function canArchiveClient(role: Role): boolean {
  return ARCHIVERS.includes(role);
}
