/**
 * White KPI card on the cream operations background (ARTIVERGES NEXT).
 * Shared across the dashboard and module summaries.
 */
export function MetricCard({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: string;
  tone?: "navy" | "green" | "orange";
}) {
  const valueColor =
    tone === "green"
      ? "text-success"
      : tone === "orange"
        ? "text-accent-600"
        : "text-text-primary";
  return (
    <div className="rounded-lg border border-[#ece7db] bg-white p-5 shadow-1">
      <div className="text-body-sm font-medium text-text-secondary">
        {label}
      </div>
      <div className={`mt-2 text-h1 font-bold tabular-nums ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}
