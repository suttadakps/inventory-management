/** Quotation financial calculations (pure). Subtotal → Discount → VAT → Grand Total. */

export type DiscountType = "percent" | "amount";

export type QuotationTotals = {
  subtotal: number;
  discountAmount: number;
  taxable: number;
  taxAmount: number;
  total: number;
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeQuotationTotals(input: {
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  taxPct: number;
}): QuotationTotals {
  const subtotal = Math.max(0, input.subtotal || 0);
  const rawDiscount =
    input.discountType === "percent"
      ? (subtotal * (input.discountValue || 0)) / 100
      : input.discountValue || 0;
  const discountAmount = round2(Math.min(Math.max(0, rawDiscount), subtotal));
  const taxable = round2(subtotal - discountAmount);
  const taxAmount = round2((taxable * (input.taxPct || 0)) / 100);
  const total = round2(taxable + taxAmount);
  return { subtotal: round2(subtotal), discountAmount, taxable, taxAmount, total };
}
