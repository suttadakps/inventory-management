import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Server-rendered pagination (docs/05_API_SPEC.md §4). Builds hrefs via the
 * provided `hrefFor` so the caller controls which query params are preserved.
 */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
}) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const linkCls = (disabled: boolean) =>
    cn(
      "inline-flex h-9 min-w-9 items-center justify-center rounded-sm border border-border px-3 text-body-sm font-medium",
      disabled
        ? "pointer-events-none opacity-40"
        : "bg-surface text-text-primary hover:bg-primary-100"
    );

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="Pagination"
    >
      <p className="text-body-sm text-text-secondary">
        Showing <span className="font-medium text-text-primary">{from}</span>–
        <span className="font-medium text-text-primary">{to}</span> of{" "}
        <span className="font-medium text-text-primary">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(prev)}
          className={linkCls(page <= 1)}
          aria-disabled={page <= 1}
          scroll={false}
        >
          ← Prev
        </Link>
        <span className="px-2 text-body-sm text-text-secondary">
          Page {page} of {totalPages}
        </span>
        <Link
          href={hrefFor(next)}
          className={linkCls(page >= totalPages)}
          aria-disabled={page >= totalPages}
          scroll={false}
        >
          Next →
        </Link>
      </div>
    </nav>
  );
}
