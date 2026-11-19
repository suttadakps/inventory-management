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

/**
 * Who may answer a "รออนุมัติ" item. Clients are added here on purpose: the
 * whole point of that list is that the decision is theirs — a colour, a
 * material, a variation — and making them phone it in just moves the delay
 * somewhere we cannot see it. Workers stay read-only.
 */
const APPROVERS: readonly Role[] = [
  "owner",
  "admin",
  "ae",
  "site_engineer",
  "client",
];

export function canAnswerApproval(role: Role): boolean {
  return APPROVERS.includes(role);
}
