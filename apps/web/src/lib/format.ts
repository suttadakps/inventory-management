const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format a number as INR currency. `compact` drops the decimals. */
export function formatMoney(value: number | null, compact = false): string {
  if (value === null || Number.isNaN(value)) return "—";
  return (compact ? inr0 : inr).format(value);
}

export function formatPct(value: number): string {
  return `${(Math.round(value * 100) / 100).toFixed(1)}%`;
}
