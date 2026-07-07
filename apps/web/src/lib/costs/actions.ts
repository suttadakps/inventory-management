"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import * as repo from "./repository";

export type CostResult = { ok: true } | { ok: false; error: string };

export async function addExpenseAction(input: {
  projectId?: string;
  category: string;
  amount: number;
  date?: string;
  description?: string;
}): Promise<CostResult> {
  const user = await requireUser();
  if (!repo.canManageCosts(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์บันทึกต้นทุน" };
  if (!input.category?.trim())
    return { ok: false, error: "กรุณาเลือกหมวดต้นทุน" };
  if (!(input.amount > 0)) return { ok: false, error: "กรุณากรอกจำนวนเงิน" };

  await repo.createExpense(
    {
      projectId: input.projectId || null,
      category: input.category.trim(),
      description: input.description?.trim() || undefined,
      amount: input.amount,
      incurredAt: input.date ? new Date(input.date) : undefined,
    },
    user.id
  );
  revalidatePath("/costs");
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteExpenseAction(id: string): Promise<CostResult> {
  const user = await requireUser();
  if (!repo.canManageCosts(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์" };
  const projectId = await repo.deleteExpense(id, user.id);
  revalidatePath("/costs");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
