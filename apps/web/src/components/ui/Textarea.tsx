import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-20 w-full rounded-sm border bg-surface px-3 py-2 text-body text-text-primary",
          "placeholder:text-text-disabled",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500",
          "disabled:pointer-events-none disabled:opacity-50",
          invalid ? "border-danger" : "border-border",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
