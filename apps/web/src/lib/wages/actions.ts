"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import * as repo from "./repository";

export type WageResult = { ok: true } | { ok: false; error: string };

export async function addWageAction(input: {
  projectId?: string;
  workerName: string;
  roleLabel?: string;
  daysWorked?: number;
  amount: number;
  workDate?: string;
  note?: string;
}): Promise<WageResult> {
  const user = await requireUser();
  if (!repo.canManageWages(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์บันทึกค่าแรง" };

  const workerName = input.workerName.trim();
  if (!workerName) return { ok: false, error: "กรุณากรอกชื่อคนงาน" };
  if (!(input.amount > 0)) return { ok: false, error: "กรุณากรอกค่าแรง" };

  await repo.createWage(
    {
      projectId: input.projectId || null,
      workerName,
      roleLabel: input.roleLabel?.trim() || undefined,
      daysWorked: input.daysWorked && input.daysWorked > 0 ? input.daysWorked : 0,
      amount: input.amount,
      workDate: input.workDate ? new Date(input.workDate) : undefined,
      note: input.note?.trim() || undefined,
    },
    user.id
  );
  revalidatePath("/wages");
  return { ok: true };
}

export async function markWagePaidAction(
  id: string,
  input: { paidAt: string; amount: number; projectId: string | null }
): Promise<WageResult> {
  const user = await requireUser();
  if (!repo.canManageWages(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์" };
  if (!(input.amount > 0)) return { ok: false, error: "กรุณากรอกจำนวนที่จ่าย" };
  const paidAt = new Date(input.paidAt);
  if (Number.isNaN(paidAt.getTime()))
    return { ok: false, error: "กรุณาเลือกวันที่ให้ถูกต้อง" };

  await repo.markWagePaid(id, {
    paidAt,
    amount: input.amount,
    projectId: input.projectId,
  });
  revalidatePath("/wages");
  return { ok: true };
}

export async function unmarkWagePaidAction(id: string): Promise<WageResult> {
  const user = await requireUser();
  if (!repo.canManageWages(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์" };
  await repo.unmarkWagePaid(id);
  revalidatePath("/wages");
  return { ok: true };
}

export async function deleteWageAction(id: string): Promise<WageResult> {
  const user = await requireUser();
  if (!repo.canManageWages(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์" };
  await repo.deleteWage(id);
  revalidatePath("/wages");
  return { ok: true };
}
