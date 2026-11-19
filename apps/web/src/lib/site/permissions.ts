import type { Role } from "@/lib/auth/roles";

/**
 * Who may post site updates from the portal.
 *
 * Site engineers run the job, so they add milestones, tick them off and upload
 * photos. Clients and workers read the same page but cannot change it — the
 * client is the audience, and the worker roster is a long list of accounts we
 * do not want writing to the record.
 */
const SITE_EDITORS: readonly Role[] = ["owner", "admin", "ae", "site_engineer"];

export function canUpdateSite(role: Role): boolean {
  return SITE_EDITORS.includes(role);
}
