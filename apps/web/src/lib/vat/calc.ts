/** VAT portion of a VAT-inclusive amount (7% Thai VAT), rounded to satang. */
export function vatFromInclusiveAmount(amount: number): number {
  return Math.round((amount - amount / 1.07) * 100) / 100;
}
