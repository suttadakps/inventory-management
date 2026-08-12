"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageWht } from "./permissions";
import * as repo from "./repository";
import type { WhtCertificateInput } from "./repository";

export type WhtFormInput = {
  projectId: string;
  filingForm: string;
  bookNo: string;
  docNo: string;
  payerTaxId: string;
  payeeTaxId: string;
  payeeName: string;
  payeeAddress: string;
  incomeCategory: string;
  incomeDescription: string;
  paymentDate: string;
  amountPaid: string;
  taxWithheld: string;
  withholdingType: string;
  withholdingOther: string;
  signerName: string;
  signedDate: string;
  sourceType?: string;
  sourceId?: string;
};

export type WhtResult = { ok: true; id: string } | { ok: false; error: string };

function toRepoInput(input: WhtFormInput): WhtCertificateInput | { error: string } {
  const payeeName = input.payeeName.trim();
  if (!payeeName) return { error: "กรุณากรอกชื่อผู้ถูกหักภาษี" };

  const amountPaid = Number(input.amountPaid);
  if (!(amountPaid > 0)) return { error: "กรุณากรอกจำนวนเงินที่จ่าย" };

  const taxWithheld = Number(input.taxWithheld);
  if (!(taxWithheld >= 0)) return { error: "กรุณากรอกภาษีที่หักนำส่ง" };

  const paymentDate = new Date(input.paymentDate);
  if (Number.isNaN(paymentDate.getTime()))
    return { error: "กรุณาเลือกวันที่จ่ายให้ถูกต้อง" };

  const incomeDescription = input.incomeDescription.trim();
  if (!incomeDescription) return { error: "กรุณาระบุประเภทเงินได้" };

  const signedDate = input.signedDate ? new Date(input.signedDate) : null;
  if (signedDate && Number.isNaN(signedDate.getTime()))
    return { error: "กรุณาเลือกวันที่ลงนามให้ถูกต้อง" };

  const sourceType =
    input.sourceType === "expense" || input.sourceType === "disbursement"
      ? input.sourceType
      : null;

  return {
    projectId: input.projectId || null,
    filingForm: input.filingForm === "pnd53" ? "pnd53" : "pnd3",
    bookNo: input.bookNo.trim() || null,
    docNo: input.docNo.trim() || null,
    payerTaxId: input.payerTaxId.trim() || null,
    payeeTaxId: input.payeeTaxId.trim() || null,
    payeeName,
    payeeAddress: input.payeeAddress.trim() || null,
    incomeCategory: input.incomeCategory === "5" ? "5" : "6",
    incomeDescription,
    paymentDate,
    amountPaid,
    taxWithheld,
    withholdingType: ["1", "2", "3", "4"].includes(input.withholdingType)
      ? input.withholdingType
      : "1",
    withholdingOther: input.withholdingOther.trim() || null,
    signerName: input.signerName.trim() || null,
    signedDate,
    sourceType,
    sourceId: input.sourceId || null,
  };
}

export async function createWhtCertificateAction(
  input: WhtFormInput
): Promise<WhtResult> {
  const user = await requireUser();
  if (!canManageWht(user.role)) return { ok: false, error: "ไม่มีสิทธิ์ออกใบทวิ 50" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const id = await repo.createWhtCertificate(parsed, user.id);
  revalidatePath("/wht");
  return { ok: true, id };
}

export async function updateWhtCertificateAction(
  id: string,
  input: WhtFormInput
): Promise<WhtResult> {
  const user = await requireUser();
  if (!canManageWht(user.role)) return { ok: false, error: "ไม่มีสิทธิ์แก้ไขใบทวิ 50" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  await repo.updateWhtCertificate(id, parsed);
  revalidatePath("/wht");
  revalidatePath(`/wht/${id}`);
  return { ok: true, id };
}

export async function deleteWhtCertificateAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!canManageWht(user.role)) return;
  await repo.deleteWhtCertificate(id);
  revalidatePath("/wht");
  redirect("/wht");
}
