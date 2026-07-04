import type { Role } from "@/lib/auth/roles";

/**
 * Projects-module access rules (docs/06_PERMISSION_MATRIX.md §5, §7).
 * Enforced in the app layer because Prisma bypasses RLS.
 *
 * - Create / Archive: owner, admin, ae.
 * - Edit: owner, admin, ae; a site engineer for a project they are assigned to.
 * - View: owner/admin/ae (all); site_engineer/worker (assigned); client (own).
 */

const MANAGERS: readonly Role[] = ["owner", "admin", "ae"];

export function canCreateProject(role: Role): boolean {
  return MANAGERS.includes(role);
}

export function canArchiveProject(role: Role): boolean {
  return MANAGERS.includes(role);
}

/** Whether a role can see *all* projects (vs. only assigned/own). */
export function canViewAllProjects(role: Role): boolean {
  return MANAGERS.includes(role);
}

export function canEditProject(
  role: Role,
  ctx: { isManager: boolean; isAssignedEngineer: boolean }
): boolean {
  if (MANAGERS.includes(role)) return true;
  if (role === "site_engineer") return ctx.isAssignedEngineer || ctx.isManager;
  return false;
}
