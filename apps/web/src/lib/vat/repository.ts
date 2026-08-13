import { prisma } from "@/lib/db";

export type VatTotals = {
  salesTotal: number;
  salesVat: number;
  purchaseTotal: number;
  purchaseVat: number;
};

/** Sums VAT-tagged expenses (purchases) and incoming payments (sales) for a
 * given calendar month. Only rows with a "มี VAT" amount set are counted -
 * matches VAT being opt-in per line on the cost/payment forms. */
export async function computeVatTotals(
  year: number,
  month: number
): Promise<VatTotals> {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));

  const [expenses, payments] = await Promise.all([
    prisma.expense.findMany({
      where: {
        incurredAt: { gte: from, lt: to },
        vatAmount: { not: null },
        deletedAt: null,
      },
      select: { amount: true, vatAmount: true },
    }),
    prisma.payment.findMany({
      where: {
        direction: "incoming",
        paidAt: { gte: from, lt: to },
        vatAmount: { not: null },
      },
      select: { amount: true, vatAmount: true },
    }),
  ]);

  const purchaseVat = expenses.reduce((s, e) => s + (e.vatAmount?.toNumber() ?? 0), 0);
  const purchaseTotal = expenses.reduce(
    (s, e) => s + (e.amount.toNumber() - (e.vatAmount?.toNumber() ?? 0)),
    0
  );
  const salesVat = payments.reduce((s, p) => s + (p.vatAmount?.toNumber() ?? 0), 0);
  const salesTotal = payments.reduce(
    (s, p) => s + (p.amount.toNumber() - (p.vatAmount?.toNumber() ?? 0)),
    0
  );

  return {
    salesTotal: Math.round(salesTotal * 100) / 100,
    salesVat: Math.round(salesVat * 100) / 100,
    purchaseTotal: Math.round(purchaseTotal * 100) / 100,
    purchaseVat: Math.round(purchaseVat * 100) / 100,
  };
}

export type VatFilingItem = {
  id: string;
  periodYear: number;
  periodMonth: number;
  payerTaxId: string | null;
  salesTotal: number;
  salesVat: number;
  purchaseTotal: number;
  purchaseVat: number;
  overpaidPrior: number;
  filedDate: string | null;
  createdAt: string;
};

function toItem(row: {
  id: string;
  periodYear: number;
  periodMonth: number;
  payerTaxId: string | null;
  salesTotal: { toNumber(): number };
  salesVat: { toNumber(): number };
  purchaseTotal: { toNumber(): number };
  purchaseVat: { toNumber(): number };
  overpaidPrior: { toNumber(): number };
  filedDate: Date | null;
  createdAt: Date;
}): VatFilingItem {
  return {
    id: row.id,
    periodYear: row.periodYear,
    periodMonth: row.periodMonth,
    payerTaxId: row.payerTaxId,
    salesTotal: row.salesTotal.toNumber(),
    salesVat: row.salesVat.toNumber(),
    purchaseTotal: row.purchaseTotal.toNumber(),
    purchaseVat: row.purchaseVat.toNumber(),
    overpaidPrior: row.overpaidPrior.toNumber(),
    filedDate: row.filedDate ? row.filedDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export type VatFilingInput = {
  periodYear: number;
  periodMonth: number;
  payerTaxId: string | null;
  salesTotal: number;
  salesVat: number;
  purchaseTotal: number;
  purchaseVat: number;
  overpaidPrior: number;
  filedDate: Date | null;
};

export async function listVatFilings(): Promise<VatFilingItem[]> {
  const rows = await prisma.vatFiling.findMany({
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    take: 60,
  });
  return rows.map(toItem);
}

export async function getVatFiling(id: string): Promise<VatFilingItem | null> {
  const row = await prisma.vatFiling.findUnique({ where: { id } });
  return row ? toItem(row) : null;
}

export async function createVatFiling(
  input: VatFilingInput,
  actorId: string
): Promise<string> {
  const created = await prisma.vatFiling.create({
    data: { ...input, createdById: actorId },
    select: { id: true },
  });
  return created.id;
}

export async function updateVatFiling(
  id: string,
  input: VatFilingInput
): Promise<void> {
  await prisma.vatFiling.update({ where: { id }, data: input });
}

export async function deleteVatFiling(id: string): Promise<void> {
  await prisma.vatFiling.delete({ where: { id } });
}
