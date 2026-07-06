import { cn } from "@/lib/utils/cn";

/**
 * Pill badge tuned to the cream operations palette. Shared across modules so
 * status chips stay consistent (projects, clients, BOQ, contracts, …).
 */
export type StatusTone = "navy" | "tan" | "green" | "amber" | "gray";

const TONES: Record<StatusTone, string> = {
  navy: "bg-[#e3ecf7] text-primary-700",
  tan: "bg-[#efe9dc] text-[#8a7a55]",
  green: "bg-[#dcefe4] text-success",
  amber: "bg-[#fbe4cf] text-[#a9791b]",
  gray: "bg-[#ece9e2] text-neutral",
};

export function StatusBadge({
  tone = "gray",
  className,
  children,
}: {
  tone?: StatusTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-caption font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
