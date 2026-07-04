import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Semantic status families (docs/04_UI_DESIGN_SYSTEM.md §11).
export type BadgeTone = "success" | "info" | "warning" | "danger" | "neutral";

const TONES: Record<BadgeTone, string> = {
  success: "text-success ring-success",
  info: "text-info ring-info",
  warning: "text-warning ring-warning",
  danger: "text-danger ring-danger",
  neutral: "text-neutral ring-neutral",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm bg-surface px-2 py-0.5 text-caption font-medium ring-1 ring-inset",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
