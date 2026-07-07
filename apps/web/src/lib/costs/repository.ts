import { Prisma } from "@artiverges/database";

import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";

/**
 * Cost tracking (บันทึกต้นทุน) repository — backed by the existing `expenses`
 * table. Recording a project cost keeps that project's actual_cost in sync
 * (actual_cost = sum of its non-deleted expenses).
 */

export function canViewAllCosts(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "ae";
}

export function canManageCosts(role: Role): boolean {
  return (
    role === "owner" ||
    role === "admin" ||
    role === "ae" ||
    role === "site_engineer"
  );
}

export type ExpenseRow = {
  id: string;
  projectName: string | null;
  category: string;
  description: string | null;
  amount: number;
  date: string;
};

async function syncActualCost(
  tx: Prisma.TransactionClient,
  projectId: string
): Promise<void> {
  const agg = await tx.expense.aggregate({
    where: { projectId, deletedAt: null },
    _sum: { amount: true },
  });
  await tx.project.update({
    where: { id: projectId },
    data: { actualCost: agg._sum.amount ?? 0 },
  });
}

export async function listExpenses(user: CurrentUser): Promise<ExpenseRow[]> {
  const where: Prisma.ExpenseWhereInput = canViewAllCosts(user.role)
    ? { deletedAt: null }
    : { deletedAt: null, createdById: user.id };

  const rows = await prisma.expense.findMany({
    where,
    orderBy: { incurredAt: "desc" },
    take: 200,
    include: { project: { select: { name: true } } },
  });

  return rows.map((e) => ({
    id: e.id,
    projectName: e.project?.name ?? null,
    category: e.category,
    description: e.description,
    amount: e.amount.toNumber(),
    date: e.incurredAt.toISOString(),
  }));
}

export async function createExpense(
  input: {
    projectId?: string | null;
    category: string;
    description?: string;
    amount: number;
    incurredAt?: Date;
  },
  userId: string
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const e = await tx.expense.create({
      data: {
        projectId: input.projectId ?? null,
        category: input.category,
        description: input.description ?? null,
        amount: input.amount,
        incurredAt: input.incurredAt ?? new Date(),
        spentById: userId,
        createdById: userId,
        updatedById: userId,
      },
      select: { id: true, projectId: true },
    });
    if (e.projectId) await syncActualCost(tx, e.projectId);
    return e.id;
  });
}

export async function deleteExpense(
  id: string,
  userId: string
): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const e = await tx.expense.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
      select: { projectId: true },
    });
    if (e.projectId) await syncActualCost(tx, e.projectId);
    return e.projectId;
  });
}
