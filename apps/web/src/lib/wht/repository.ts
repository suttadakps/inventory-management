import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import { canManageWht } from "./permissions";

export type WhtCertificateItem = {
  id: string;
  projectId: string | null;
  projectName: string | null;
  filingForm: string;
  bookNo: string | null;
  docNo: string | null;
  payerTaxId: string | null;
  payeeTaxId: string | null;
  payeeName: string;
  payeeAddress: string | null;
  incomeCategory: string;
  incomeDescription: string;
  paymentDate: string;
  amountPaid: number;
  taxWithheld: number;
  withholdingType: string;
  withholdingOther: string | null;
  signerName: string | null;
  signedDate: string | null;
  createdAt: string;
};

function toItem(row: {
  id: string;
  projectId: string | null;
  project: { name: string } | null;
  filingForm: string;
  bookNo: string | null;
  docNo: string | null;
  payerTaxId: string | null;
  payeeTaxId: string | null;
  payeeName: string;
  payeeAddress: string | null;
  incomeCategory: string;
  incomeDescription: string;
  paymentDate: Date;
  amountPaid: { toNumber(): number };
  taxWithheld: { toNumber(): number };
  withholdingType: string;
  withholdingOther: string | null;
  signerName: string | null;
  signedDate: Date | null;
  createdAt: Date;
}): WhtCertificateItem {
  return {
    id: row.id,
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    filingForm: row.filingForm,
    bookNo: row.bookNo,
    docNo: row.docNo,
    payerTaxId: row.payerTaxId,
    payeeTaxId: row.payeeTaxId,
    payeeName: row.payeeName,
    payeeAddress: row.payeeAddress,
    incomeCategory: row.incomeCategory,
    incomeDescription: row.incomeDescription,
    paymentDate: row.paymentDate.toISOString(),
    amountPaid: row.amountPaid.toNumber(),
    taxWithheld: row.taxWithheld.toNumber(),
    withholdingType: row.withholdingType,
    withholdingOther: row.withholdingOther,
    signerName: row.signerName,
    signedDate: row.signedDate ? row.signedDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export type WhtCertificateInput = {
  projectId: string | null;
  filingForm: string;
  bookNo: string | null;
  docNo: string | null;
  payerTaxId: string | null;
  payeeTaxId: string | null;
  payeeName: string;
  payeeAddress: string | null;
  incomeCategory: string;
  incomeDescription: string;
  paymentDate: Date;
  amountPaid: number;
  taxWithheld: number;
  withholdingType: string;
  withholdingOther: string | null;
  signerName: string | null;
  signedDate: Date | null;
  sourceType?: "expense" | "disbursement" | "wage" | null;
  sourceId?: string | null;
};

export async function listWhtCertificates(
  user: CurrentUser
): Promise<WhtCertificateItem[]> {
  if (!canManageWht(user.role)) return [];
  const rows = await prisma.whtCertificate.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { project: { select: { name: true } } },
  });
  return rows.map(toItem);
}

export async function getWhtCertificate(
  user: CurrentUser,
  id: string
): Promise<WhtCertificateItem | null> {
  if (!canManageWht(user.role)) return null;
  const row = await prisma.whtCertificate.findUnique({
    where: { id },
    include: { project: { select: { name: true } } },
  });
  return row ? toItem(row) : null;
}

export async function createWhtCertificate(
  input: WhtCertificateInput,
  actorId: string
): Promise<string> {
  const created = await prisma.whtCertificate.create({
    data: {
      projectId: input.projectId,
      filingForm: input.filingForm,
      bookNo: input.bookNo,
      docNo: input.docNo,
      payerTaxId: input.payerTaxId,
      payeeTaxId: input.payeeTaxId,
      payeeName: input.payeeName,
      payeeAddress: input.payeeAddress,
      incomeCategory: input.incomeCategory,
      incomeDescription: input.incomeDescription,
      paymentDate: input.paymentDate,
      amountPaid: input.amountPaid,
      taxWithheld: input.taxWithheld,
      withholdingType: input.withholdingType,
      withholdingOther: input.withholdingOther,
      signerName: input.signerName,
      signedDate: input.signedDate,
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
      createdById: actorId,
    },
    select: { id: true },
  });
  return created.id;
}

export async function updateWhtCertificate(
  id: string,
  input: WhtCertificateInput
): Promise<void> {
  await prisma.whtCertificate.update({
    where: { id },
    data: {
      projectId: input.projectId,
      filingForm: input.filingForm,
      bookNo: input.bookNo,
      docNo: input.docNo,
      payerTaxId: input.payerTaxId,
      payeeTaxId: input.payeeTaxId,
      payeeName: input.payeeName,
      payeeAddress: input.payeeAddress,
      incomeCategory: input.incomeCategory,
      incomeDescription: input.incomeDescription,
      paymentDate: input.paymentDate,
      amountPaid: input.amountPaid,
      taxWithheld: input.taxWithheld,
      withholdingType: input.withholdingType,
      withholdingOther: input.withholdingOther,
      signerName: input.signerName,
      signedDate: input.signedDate,
    },
  });
}

export async function deleteWhtCertificate(id: string): Promise<void> {
  await prisma.whtCertificate.delete({ where: { id } });
}

export type WhtSourceSeed = {
  projectId: string | null;
  projectName: string | null;
  description: string;
  amount: number;
  suggestedPayeeName?: string;
};

/** Seed data for the "start from an existing record" flow — amount is
 * real, description is only a starting guess for the payee/income text. */
export async function getExpenseForWht(id: string): Promise<WhtSourceSeed | null> {
  const row = await prisma.expense.findUnique({
    where: { id },
    include: { project: { select: { name: true } } },
  });
  if (!row) return null;
  return {
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    description: row.description ?? row.category,
    amount: row.amount.toNumber(),
  };
}

export async function getDisbursementForWht(id: string): Promise<WhtSourceSeed | null> {
  const row = await prisma.disbursement.findUnique({
    where: { id },
    include: { project: { select: { name: true } } },
  });
  if (!row) return null;
  return {
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    description: row.reason ?? row.requesterName,
    amount: row.amount.toNumber(),
  };
}

export async function getWageForWht(id: string): Promise<WhtSourceSeed | null> {
  const row = await prisma.wageEntry.findUnique({
    where: { id },
    include: { project: { select: { name: true } } },
  });
  if (!row) return null;
  return {
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    description: `ค่าแรง ${row.workerName}`,
    amount: row.amount.toNumber(),
    suggestedPayeeName: row.workerName,
  };
}
