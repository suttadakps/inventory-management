"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageWorkers } from "./permissions";
import * as repo from "./repository";
import type { WorkerInput } from "./repository";

export type WorkerFormInput = {
  name: string;
  taxId: string;
  position: string;
  phone: string;
  address: string;
};

export type WorkerResult = { ok: true; id: string } | { ok: false; error: string };

function toRepoInput(input: WorkerFormInput): WorkerInput | { error: string } {
  const name = input.name.trim();
  if (!name) return { error: "กรุณากรอกชื่อช่าง" };

  return {
    name,
    taxId: input.taxId.trim() || null,
    position: input.position.trim() || null,
    phone: input.phone.trim() || null,
    address: input.address.trim() || null,
  };
}

export async function createWorkerAction(
  input: WorkerFormInput
): Promise<WorkerResult> {
  const user = await requireUser();
  if (!canManageWorkers(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์จัดการรายชื่อช่าง" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const id = await repo.createWorker(parsed, user.id);
  revalidatePath("/workers");
  return { ok: true, id };
}

export async function updateWorkerAction(
  id: string,
  input: WorkerFormInput
): Promise<WorkerResult> {
  const user = await requireUser();
  if (!canManageWorkers(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์จัดการรายชื่อช่าง" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  await repo.updateWorker(id, parsed);
  revalidatePath("/workers");
  revalidatePath(`/workers/${id}`);
  return { ok: true, id };
}

export async function deleteWorkerAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!canManageWorkers(user.role)) return;
  await repo.deleteWorker(id);
  revalidatePath("/workers");
  redirect("/workers");
}

/** Used only by the opt-in "save to roster" checkbox on the WHT form —
 * best-effort, does not gate on canManageWorkers since issuing a WHT
 * certificate already required canManageWht (a stricter permission). */
export async function createWorkerFromWhtAction(input: {
  name: string;
  taxId?: string;
  address?: string;
}): Promise<void> {
  const user = await requireUser();
  const name = input.name.trim();
  if (!name) return;
  await repo.createWorker(
    {
      name,
      taxId: input.taxId?.trim() || null,
      position: null,
      phone: null,
      address: input.address?.trim() || null,
    },
    user.id
  );
  revalidatePath("/workers");
}
