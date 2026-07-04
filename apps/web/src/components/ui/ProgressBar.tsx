import { cn } from "@/lib/utils/cn";

/** Clamped progress meter (0–100). */
export function ProgressBar({
  value,
  className,
  showLabel = false,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const tone =
    pct >= 100 ? "bg-success" : pct > 0 ? "bg-primary-600" : "bg-neutral";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-primary-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 text-right text-caption tabular-nums text-text-secondary">
          {pct}%
        </span>
      )}
    </div>
  );
}
