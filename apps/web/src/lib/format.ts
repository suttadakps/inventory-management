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

const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const thb0 = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

/** Format a number as THB (฿) currency. `compact` drops the decimals. */
export function formatBaht(value: number | null, compact = false): string {
  if (value === null || Number.isNaN(value)) return "—";
  return (compact ? thb0 : thb).format(value);
}

export function formatPct(value: number): string {
  return `${(Math.round(value * 100) / 100).toFixed(1)}%`;
}

const dateBkkFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Bangkok",
});

/** Format a date as dd/mm/yyyy in Bangkok local time (e.g. for LINE messages). */
export function formatDateBkk(date: Date): string {
  return dateBkkFmt.format(date);
}
