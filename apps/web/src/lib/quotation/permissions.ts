import type { Role } from "@/lib/auth/roles";

/**
 * Quotation-module access rules (per the module requirements).
 * Enforced in the app layer because Prisma bypasses RLS.
 *
 * - Managers (owner, admin, ae/PM): full — generate, edit drafts, workflow,
 *   duplicate/revise, archive.
 * - Client: view only, and only `approved` quotations.
 * - site_engineer / worker: no access to this module.
 */

const MANAGERS: readonly Role[] = ["owner", "admin", "ae"];

export function canManageQuotation(role: Role): boolean {
  return MANAGERS.includes(role);
}

export function canViewQuotations(role: Role): boolean {
  return MANAGERS.includes(role) || role === "client";
}

export function isQuotationEditable(role: Role, status: string): boolean {
  return MANAGERS.includes(role) && status === "draft";
}

/** Statuses a role may see (`null` = all). */
export function visibleQuotationStatuses(role: Role): readonly string[] | null {
  if (role === "client") return ["approved"];
  return null;
}
