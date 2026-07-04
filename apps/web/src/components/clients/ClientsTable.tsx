import Link from "next/link";

import type { ClientListItem } from "@/lib/clients/repository";
import { Badge } from "@/components/ui/Badge";

/** Responsive clients table: full columns on md+, condensed on small screens. */
export function ClientsTable({ items }: { items: ClientListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-body font-medium text-text-primary">
          No clients found
        </p>
        <p className="mt-1 text-body-sm text-text-secondary">
          Adjust your search, or add a new client to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <table className="w-full text-left text-body-sm">
        <thead className="border-b border-border bg-bg text-caption uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">
              Contact
            </th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Phone</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">Tax ID</th>
            <th className="px-4 py-3 text-right font-medium">Projects</th>
            <th className="px-4 py-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((c) => (
            <tr key={c.id} className="hover:bg-primary-100/40">
              <td className="px-4 py-3 align-top">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/clients/${c.id}`}
                    className="font-medium text-primary-700 hover:underline"
                  >
                    {c.name}
                  </Link>
                  {c.archived && (
                    <span className="rounded-sm bg-neutral px-1.5 py-0.5 text-caption text-white">
                      Archived
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-caption text-text-secondary md:hidden">
                  {c.email ?? c.contactPerson ?? "—"}
                </div>
              </td>
              <td className="hidden px-4 py-3 align-top md:table-cell">
                <div className="text-text-primary">{c.contactPerson ?? "—"}</div>
                {c.email && (
                  <div className="text-caption text-text-secondary">
                    {c.email}
                  </div>
                )}
              </td>
              <td className="hidden px-4 py-3 align-top text-text-primary lg:table-cell">
                {c.phone ?? "—"}
              </td>
              <td className="hidden px-4 py-3 align-top font-mono text-text-primary xl:table-cell">
                {c.taxId ?? "—"}
              </td>
              <td className="px-4 py-3 text-right align-top">
                <Badge tone={c.projectCount > 0 ? "info" : "neutral"}>
                  {c.projectCount}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right align-top">
                <Link
                  href={`/clients/${c.id}`}
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
