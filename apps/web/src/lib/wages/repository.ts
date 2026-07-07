import { Prisma, type WageStatus } from "@artiverges/database";

import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";

/**
 * Wage entries (สรุปค่าแรง) repository — a labor-cost ledger with free-text
 * worker names and a simple unpaid → paid status. Role-scoped here.
 */

export function canViewAllWages(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "ae";
}

export function canManageWages(role: Role): boolean {
  return (
    role === "owner" ||
    role === "admin" ||
    role === "ae" ||
    role === "site_engineer"
  );
}

export type WageRow = {
  id: string;
  workerName: string;
  roleLabel: string | null;
  projectName: string | null;
  daysWorked: number;
  amount: number;
  date: string | null;
  status: WageStatus;
};

export type WageSummary = {
  total: number;
  paid: number;
  unpaid: number;
  rows: WageRow[];
};

export async function listWages(user: CurrentUser): Promise<WageSummary> {
  const where: Prisma.WageEntryWhereInput = canViewAllWages(user.role)
    ? {}
    : { createdById: user.id };

  const rows = await prisma.wageEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { project: { select: { name: true } } },
  });

  const mapped: WageRow[] = rows.map((w) => ({
    id: w.id,
    workerName: w.workerName,
    roleLabel: w.roleLabel,
    projectName: w.project?.name ?? null,
    daysWorked: w.daysWorked.toNumber(),
    amount: w.amount.toNumber(),
    date: w.workDate ? w.workDate.toISOString().slice(0, 10) : null,
    status: w.status,
  }));

  const total = mapped.reduce((s, r) => s + r.amount, 0);
  const paid = mapped
    .filter((r) => r.status === "paid")
    .reduce((s, r) => s + r.amount, 0);

  return { total, paid, unpaid: total - paid, rows: mapped };
}

export async function createWage(
  input: {
    projectId?: string | null;
    workerName: string;
    roleLabel?: string;
    daysWorked?: number;
    amount: number;
    workDate?: Date;
    note?: string;
  },
  userId: string
): Promise<string> {
  const w = await prisma.wageEntry.create({
    data: {
      projectId: input.projectId ?? null,
      workerName: input.workerName,
      roleLabel: input.roleLabel ?? null,
      daysWorked: input.daysWorked ?? 0,
      amount: input.amount,
      workDate: input.workDate ?? null,
      note: input.note ?? null,
      createdById: userId,
    },
    select: { id: true },
  });
  return w.id;
}

export async function setWagePaid(
  id: string,
  paid: boolean
): Promise<void> {
  await prisma.wageEntry.update({
    where: { id },
    data: {
      status: paid ? "paid" : "unpaid",
      paidAt: paid ? new Date() : null,
    },
  });
}

export async function deleteWage(id: string): Promise<void> {
  await prisma.wageEntry.delete({ where: { id } });
}
