"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import * as repo from "./repository";

export type DisbursementResult = { ok: true } | { ok: false; error: string };

export async function submitDisbursementAction(input: {
  requesterName: string;
  projectId?: string;
  amount: number;
  neededDate?: string;
  reason?: string;
}): Promise<DisbursementResult> {
  const user = await requireUser();
  if (!repo.canSubmitDisbursement(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์ยื่นคำขอ" };

  const name = input.requesterName.trim();
  if (!name) return { ok: false, error: "กรุณากรอกชื่อผู้เบิก" };
  if (!(input.amount > 0)) return { ok: false, error: "กรุณากรอกจำนวนเงิน" };

  await repo.createDisbursement(
    {
      requesterName: name,
      projectId: input.projectId || null,
      amount: input.amount,
      reason: input.reason?.trim() || undefined,
      neededDate: input.neededDate ? new Date(input.neededDate) : undefined,
    },
    user.id
  );
  revalidatePath("/disbursements");
  return { ok: true };
}

async function requireApprover() {
  const user = await requireUser();
  if (!repo.canApproveDisbursement(user.role)) return null;
  return user;
}

export async function approveDisbursementAction(
  id: string
): Promise<DisbursementResult> {
  const user = await requireApprover();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์อนุมัติ" };
  await repo.approveDisbursement(id, user.id);
  revalidatePath("/disbursements");
  return { ok: true };
}

export async function rejectDisbursementAction(
  id: string
): Promise<DisbursementResult> {
  const user = await requireApprover();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ปฏิเสธ" };
  await repo.rejectDisbursement(id, user.id);
  revalidatePath("/disbursements");
  return { ok: true };
}

export async function payDisbursementAction(
  id: string
): Promise<DisbursementResult> {
  const user = await requireApprover();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์" };
  await repo.markDisbursementPaid(id);
  revalidatePath("/disbursements");
  return { ok: true };
}
