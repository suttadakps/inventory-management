import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "error" | "success" | "info";

const VARIANTS: Record<Variant, string> = {
  error: "border-danger text-danger",
  success: "border-success text-success",
  info: "border-info text-info",
};

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-sm border border-l-4 bg-surface px-3 py-2.5 text-body-sm",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
