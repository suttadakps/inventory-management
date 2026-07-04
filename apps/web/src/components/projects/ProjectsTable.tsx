import Link from "next/link";

import type { ProjectListItem } from "@/lib/projects/repository";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";

function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  return `${start ?? "…"} → ${end ?? "…"}`;
}

/** Responsive projects table: full columns on md+, condensed on small screens. */
export function ProjectsTable({ items }: { items: ProjectListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-body font-medium text-text-primary">
          No projects found
        </p>
        <p className="mt-1 text-body-sm text-text-secondary">
          Adjust your filters, or create a new project to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <table className="w-full text-left text-body-sm">
        <thead className="border-b border-border bg-bg text-caption uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Client</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Progress</th>
            <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
              Budget
            </th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">Manager</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">
              Site engineer
            </th>
            <th className="px-4 py-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((p) => (
            <tr key={p.id} className="hover:bg-primary-100/40">
              <td className="px-4 py-3 align-top">
                <Link
                  href={`/projects/${p.id}`}
                  className="font-medium text-primary-700 hover:underline"
                >
                  {p.name}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-caption text-text-secondary">
                  <span className="font-mono">{p.code}</span>
                  {p.archived && (
                    <span className="rounded-sm bg-neutral px-1.5 py-0.5 text-white">
                      Archived
                    </span>
                  )}
                </div>
                <div className="mt-1 text-caption text-text-secondary lg:hidden">
                  {p.clientName}
                </div>
              </td>
              <td className="hidden px-4 py-3 align-top text-text-primary lg:table-cell">
                {p.clientName}
              </td>
              <td className="px-4 py-3 align-top">
                <ProjectStatusBadge status={p.status} />
              </td>
              <td className="hidden px-4 py-3 align-top md:table-cell">
                <ProgressBar value={p.progress} showLabel className="w-36" />
              </td>
              <td className="hidden px-4 py-3 text-right align-top font-mono tabular-nums text-text-primary sm:table-cell">
                {formatMoney(p.budget)}
              </td>
              <td className="hidden px-4 py-3 align-top text-text-primary xl:table-cell">
                {p.managerName ?? "—"}
              </td>
              <td className="hidden px-4 py-3 align-top text-text-primary xl:table-cell">
                {p.siteEngineerName ?? "—"}
              </td>
              <td className="px-4 py-3 text-right align-top">
                <Link
                  href={`/projects/${p.id}`}
                  className="text-body-sm font-medium text-primary-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
