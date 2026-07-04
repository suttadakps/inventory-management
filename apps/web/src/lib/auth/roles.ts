/**
 * Role codes per docs/06_PERMISSION_MATRIX.md §2.
 * Current scope implements a subset of the 10 platform roles; the remaining
 * roles (foreman, accounting, procurement, partner) are added later via
 * `ALTER TYPE public.user_role ADD VALUE ...` + this list.
 */
export const ROLES = [
  "owner",
  "admin",
  "ae",
  "site_engineer",
  "worker",
  "client",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  ae: "AE / Project Manager",
  site_engineer: "Site Engineer",
  worker: "Worker",
  client: "Client",
};

/** Roles internal to the company (vs. external Client/Partner portal roles). */
export const INTERNAL_ROLES: readonly Role[] = [
  "owner",
  "admin",
  "ae",
  "site_engineer",
  "worker",
];

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" && (ROLES as readonly string[]).includes(value)
  );
}

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}
