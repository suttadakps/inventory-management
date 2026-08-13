"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { canManageVat } from "./permissions";
import * as repo from "./repository";
import type { VatFilingInput } from "./repository";

export type VatFormInput = {
  periodYear: string;
  periodMonth: string;
  payerTaxId: string;
  salesTotal: string;
  salesVat: string;
  purchaseTotal: string;
  purchaseVat: string;
  overpaidPrior: string;
  filedDate: string;
};

export type VatResult = { ok: true; id: string } | { ok: false; error: string };

function toRepoInput(input: VatFormInput): VatFilingInput | { error: string } {
  const periodYear = Number(input.periodYear);
  const periodMonth = Number(input.periodMonth);
  if (!(periodYear > 2000) || !(periodMonth >= 1 && periodMonth <= 12))
    return { error: "กรุณาเลือกเดือน/ปีให้ถูกต้อง" };

  const num = (v: string) => (v.trim() === "" ? 0 : Number(v));
  if ([input.salesTotal, input.salesVat, input.purchaseTotal, input.purchaseVat].some((v) => Number.isNaN(num(v))))
    return { error: "กรุณากรอกจำนวนเงินให้ถูกต้อง" };

  const filedDate = input.filedDate ? new Date(input.filedDate) : null;
  if (filedDate && Number.isNaN(filedDate.getTime()))
    return { error: "กรุณาเลือกวันที่ยื่นให้ถูกต้อง" };

  return {
    periodYear,
    periodMonth,
    payerTaxId: input.payerTaxId.trim() || null,
    salesTotal: num(input.salesTotal),
    salesVat: num(input.salesVat),
    purchaseTotal: num(input.purchaseTotal),
    purchaseVat: num(input.purchaseVat),
    overpaidPrior: num(input.overpaidPrior),
    filedDate,
  };
}

export async function createVatFilingAction(input: VatFormInput): Promise<VatResult> {
  const user = await requireUser();
  if (!canManageVat(user.role)) return { ok: false, error: "ไม่มีสิทธิ์สร้างแบบ ภ.พ.30" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  try {
    const id = await repo.createVatFiling(parsed, user.id);
    revalidatePath("/vat");
    return { ok: true, id };
  } catch {
    return { ok: false, error: "มีแบบ ภ.พ.30 ของเดือนนี้อยู่แล้ว" };
  }
}

export async function updateVatFilingAction(
  id: string,
  input: VatFormInput
): Promise<VatResult> {
  const user = await requireUser();
  if (!canManageVat(user.role)) return { ok: false, error: "ไม่มีสิทธิ์แก้ไขแบบ ภ.พ.30" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  await repo.updateVatFiling(id, parsed);
  revalidatePath("/vat");
  revalidatePath(`/vat/${id}`);
  return { ok: true, id };
}

export async function deleteVatFilingAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!canManageVat(user.role)) return;
  await repo.deleteVatFiling(id);
  revalidatePath("/vat");
}

export async function computeVatTotalsAction(year: number, month: number) {
  const user = await requireUser();
  if (!canManageVat(user.role)) return null;
  return repo.computeVatTotals(year, month);
}
