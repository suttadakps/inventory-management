/**
 * Quotation arithmetic for the flat BOQ / ใบเสนอราคา.
 *
 * Pure and shared on purpose: the editor (client), the printable document and
 * the BOQ list all have to agree to the satang, and the line-level gross-up
 * below is too easy to get subtly different if each one does its own sums.
 */

export const VAT_RATE = 0.07;
export const WHT_RATE = 0.03;
/** ค่าดำเนินการ — charged on the pre-VAT amount. */
export const FEE_RATE = 0.1;

export const round2 = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Factor that lifts a price so that losing WHT_RATE of it leaves the original
 * amount behind: p/(1-r) - r·p/(1-r) = p. Note this is ~3.0928%, not 3% —
 * adding a flat 3% would still land 0.09% short, because the 3% is withheld
 * from the *raised* price, not the original one.
 */
export const WHT_GROSS_UP = 1 / (1 - WHT_RATE);

export type QuoteFlags = {
  vatEnabled: boolean;
  /** Withhold 3% — and raise the line prices so the deduction nets out. */
  whtEnabled: boolean;
  feeEnabled: boolean;
};

export type QuoteLineInput = { quantity: number; unitPrice: number };

export type QuoteLine = {
  quantity: number;
  /** Price as it should appear to the client: gross-up already folded in. */
  unitPrice: number;
  amount: number;
};

export type QuoteTotals = {
  /** Lines carrying the effective (grossed-up) prices, in input order. */
  lines: QuoteLine[];
  /** Sum of the line amounts at the prices the client is quoted. */
  subtotal: number;
  /** Sum at the prices actually typed into the editor, before any gross-up. */
  baseSubtotal: number;
  /** subtotal - baseSubtotal: what covering the 3% added to the line items. */
  grossUp: number;
  fee: number;
  /** subtotal + fee — the base for both VAT and the withholding. */
  preVat: number;
  vat: number;
  /**
   * The 3% the client will withhold when they pay. Never shown on the
   * quotation: it is already priced into the lines, so printing it as a
   * deduction would take it off twice. Kept for the editor's own summary.
   */
  wht: number;
  /** The amount actually billed — preVat + VAT, nothing deducted. */
  grandTotal: number;
  /** What lands in the bank once the client takes their 3%. */
  netReceived: number;
};

/**
 * Spreads the 3% cover across every line (so the client sees it priced in
 * rather than bolted on), then layers ค่าดำเนินการ and VAT on top. The fee
 * rides on the grossed-up subtotal, so it is covered too.
 */
export function computeQuote(
  lines: QuoteLineInput[],
  flags: QuoteFlags
): QuoteTotals {
  const factor = flags.whtEnabled ? WHT_GROSS_UP : 1;

  const computed: QuoteLine[] = lines.map((l) => {
    const quantity = l.quantity || 0;
    const unitPrice = round2((l.unitPrice || 0) * factor);
    return { quantity, unitPrice, amount: round2(quantity * unitPrice) };
  });

  const subtotal = round2(computed.reduce((s, l) => s + l.amount, 0));
  const baseSubtotal = round2(
    lines.reduce((s, l) => s + (l.quantity || 0) * (l.unitPrice || 0), 0)
  );

  const fee = flags.feeEnabled ? round2(subtotal * FEE_RATE) : 0;
  const preVat = round2(subtotal + fee);
  const vat = flags.vatEnabled ? round2(preVat * VAT_RATE) : 0;
  const wht = flags.whtEnabled ? round2(preVat * WHT_RATE) : 0;
  const grandTotal = round2(preVat + vat);

  return {
    lines: computed,
    subtotal,
    baseSubtotal,
    grossUp: round2(subtotal - baseSubtotal),
    fee,
    preVat,
    vat,
    wht,
    grandTotal,
    netReceived: round2(grandTotal - wht),
  };
}
