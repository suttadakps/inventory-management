import { Prisma, type DisbursementStatus } from "@artiverges/database";

import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";

/**
 * Disbursements (เบิกเงิน) repository. Cash-advance requests with an approval
 * workflow. Access is role-scoped here (Prisma bypasses RLS).
 */

export function canApproveDisbursement(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "ae";
}

export function canSubmitDisbursement(role: Role): boolean {
  return role !== "client";
}

export type DisbursementRow = {
  id: string;
  requesterName: string;
  projectName: string | null;
  amount: number;
  reason: string | null;
  neededDate: string | null;
  status: DisbursementStatus;
  createdAt: string;
};

export async function listDisbursements(
  user: CurrentUser
): Promise<DisbursementRow[]> {
  // Approvers see every request; everyone else sees only their own.
  const where: Prisma.DisbursementWhereInput = canApproveDisbursement(user.role)
    ? {}
    : { requestedById: user.id };

  const rows = await prisma.disbursement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { project: { select: { name: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    requesterName: r.requesterName,
    projectName: r.project?.name ?? null,
    amount: r.amount.toNumber(),
    reason: r.reason,
    neededDate: r.neededDate ? r.neededDate.toISOString().slice(0, 10) : null,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createDisbursement(
  input: {
    projectId?: string | null;
    requesterName: string;
    amount: number;
    reason?: string;
    neededDate?: Date;
  },
  userId: string
): Promise<string> {
  const d = await prisma.disbursement.create({
    data: {
      projectId: input.projectId ?? null,
      requesterName: input.requesterName,
      amount: input.amount,
      reason: input.reason ?? null,
      neededDate: input.neededDate ?? null,
      requestedById: userId,
    },
    select: { id: true },
  });
  return d.id;
}

export async function approveDisbursement(
  id: string,
  actorId: string
): Promise<void> {
  await prisma.disbursement.update({
    where: { id },
    data: { status: "approved", approvedById: actorId, approvedAt: new Date() },
  });
}

export async function rejectDisbursement(
  id: string,
  actorId: string
): Promise<void> {
  await prisma.disbursement.update({
    where: { id },
    data: { status: "rejected", approvedById: actorId, approvedAt: new Date() },
  });
}

export async function markDisbursementPaid(id: string): Promise<void> {
  await prisma.disbursement.update({
    where: { id },
    data: { status: "paid", paidAt: new Date() },
  });
}
