import type { Role } from "@/lib/auth/roles";

/** Only owner and admin manage accounts — an AE should not be able to mint one. */
const ACCOUNT_ADMINS: readonly Role[] = ["owner", "admin"];

export function canManageUsers(role: Role): boolean {
  return ACCOUNT_ADMINS.includes(role);
}
