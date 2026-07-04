import type { Role } from "@/lib/auth/roles";

/**
 * BOQ-module access rules (per the module requirements + docs/06).
 * Enforced in the app layer because Prisma bypasses RLS.
 *
 * - Managers (owner, admin, ae/PM): create, duplicate, new version, approve,
 *   archive — the BOQ lifecycle.
 * - Editors (managers + site_engineer): edit sections/categories/items and
 *   submit — but only while the BOQ is in `draft`.
 * - Worker: read-only (all statuses).
 * - Client: read-only, and only `approved` BOQs.
 */

const MANAGERS: readonly Role[] = ["owner", "admin", "ae"];
const EDITORS: readonly Role[] = ["owner", "admin", "ae", "site_engineer"];

export function canManageBoq(role: Role): boolean {
  return MANAGERS.includes(role);
}

export function canApproveBoq(role: Role): boolean {
  return MANAGERS.includes(role);
}

export function canEditBoqContent(role: Role): boolean {
  return EDITORS.includes(role);
}

/** Content is only mutable while the BOQ is a draft. */
export function isBoqEditable(role: Role, status: string): boolean {
  return canEditBoqContent(role) && status === "draft";
}

/** Statuses a role is allowed to see. `null` means "all". */
export function visibleStatusesFor(role: Role): readonly string[] | null {
  if (role === "client") return ["approved"];
  return null;
}
