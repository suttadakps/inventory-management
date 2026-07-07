import { type ReferralStatus } from "@artiverges/database";

import { prisma } from "@/lib/db";
import type { Role } from "@/lib/auth/roles";

/**
 * Partner referrals (พาร์ทเนอร์แนะนำงาน). Leads submitted from the public
 * website; admins track the follow-up status here. Internal-staff only.
 */

export function canManageReferrals(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "ae";
}

export type ReferralRow = {
  id: string;
  referrerName: string;
  referrerContact: string | null;
  projectTitle: string;
  details: string | null;
  prospectName: string | null;
  budget: number | null;
  source: string;
  status: ReferralStatus;
  adminNote: string | null;
  createdAt: string;
};

export async function listReferrals(): Promise<ReferralRow[]> {
  const rows = await prisma.referral.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return rows.map((r) => ({
    id: r.id,
    referrerName: r.referrerName,
    referrerContact: r.referrerContact,
    projectTitle: r.projectTitle,
    details: r.details,
    prospectName: r.prospectName,
    budget: r.budget ? r.budget.toNumber() : null,
    source: r.source,
    status: r.status,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createReferral(input: {
  referrerName: string;
  referrerContact?: string;
  projectTitle: string;
  details?: string;
  prospectName?: string;
  budget?: number;
  source?: string;
}): Promise<string> {
  const r = await prisma.referral.create({
    data: {
      referrerName: input.referrerName,
      referrerContact: input.referrerContact ?? null,
      projectTitle: input.projectTitle,
      details: input.details ?? null,
      prospectName: input.prospectName ?? null,
      budget: input.budget ?? null,
      source: input.source ?? "website",
    },
    select: { id: true },
  });
  return r.id;
}

export async function setReferralStatus(
  id: string,
  status: ReferralStatus,
  actorId: string
): Promise<void> {
  await prisma.referral.update({
    where: { id },
    data: { status, handledById: actorId },
  });
}

export async function setReferralNote(
  id: string,
  note: string
): Promise<void> {
  await prisma.referral.update({
    where: { id },
    data: { adminNote: note || null },
  });
}

export async function deleteReferral(id: string): Promise<void> {
  await prisma.referral.delete({ where: { id } });
}
