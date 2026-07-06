import type { Role } from "@/lib/auth/roles";

/**
 * Contracts-module access rules (per the module requirements + docs/06).
 * Enforced in the app layer because Prisma bypasses RLS.
 *
 * - Managers (owner, admin, ae/PM): full — create from quotation, edit drafts,
 *   milestones, workflow, comments, files, archive/restore.
 * - site_engineer / worker: read-only, on assigned projects.
 * - Client: read-only, and only `signed` contracts on their own project.
 */

const MANAGERS: readonly Role[] = ["owner", "admin", "ae"];

export function canManageContracts(role: Role): boolean {
  return MANAGERS.includes(role);
}

export function canCommentOnContracts(role: Role): boolean {
  // Internal staff may comment; external client is view-only.
  return role !== "client";
}

export function isContractEditable(role: Role, status: string): boolean {
  return MANAGERS.includes(role) && status === "draft";
}

/** Statuses a role may see (`null` = all). */
export function visibleContractStatuses(role: Role): readonly string[] | null {
  if (role === "client") return ["signed"];
  return null;
}
