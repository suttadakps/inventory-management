import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { canManageContracts } from "@/lib/contract/permissions";
import { listContracts, DEFAULT_PAGE_SIZE } from "@/lib/contract/repository";
import { ContractStatusBadge } from "@/components/contract/ContractStatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Contracts · ARTIVERGES NEXT" };

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; archived?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const q = sp.q?.trim() || undefined;
  const includeArchived = sp.archived === "1";
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const result = await listContracts(user, {
    q,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    includeArchived,
  });
  const canManage = canManageContracts(user.role);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (includeArchived) params.set("archived", "1");
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/contracts?${qs}` : "/contracts";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Contracts</h1>
          <p className="text-body-sm text-text-secondary">
            {result.total} {result.total === 1 ? "contract" : "contracts"}
            {includeArchived ? " (including archived)" : ""}
          </p>
        </div>
        {canManage && (
          <Link
            href="/contracts/new"
            className="inline-flex h-10 items-center justify-center rounded-sm bg-primary-600 px-4 text-body font-medium text-white hover:bg-primary-700"
          >
            New contract
          </Link>
        )}
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4"
      >
        <div className="min-w-48 flex-1 space-y-1.5">
          <label htmlFor="q" className="text-body-sm font-medium">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Contract no, title, project, or client"
          />
        </div>
        <label className="flex h-10 items-center gap-2 text-body-sm text-text-secondary">
          <input
            type="checkbox"
            name="archived"
            value="1"
            defaultChecked={includeArchived}
            className="h-4 w-4 rounded-sm border-border text-primary-600"
          />
          Show archived
        </label>
        <button
          type="submit"
          className="h-10 rounded-sm border border-border bg-surface px-4 text-body-sm font-medium text-text-primary hover:bg-primary-100"
        >
          Search
        </button>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-body-sm text-text-secondary">
          No contracts found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-border bg-bg text-caption uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Contract</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Project</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                  Milestones
                </th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.items.map((c) => (
                <tr key={c.id} className="hover:bg-primary-100/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/contracts/${c.id}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {c.contractNo}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-caption text-text-secondary">
                      <span>v{c.version}</span>
                      {c.archived && (
                        <span className="rounded-sm bg-neutral px-1.5 py-0.5 text-white">
                          Archived
                        </span>
                      )}
                      <span className="lg:hidden">· {c.projectName}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-text-primary lg:table-cell">
                    {c.projectName}
                    <div className="text-caption text-text-secondary">
                      {c.clientName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ContractStatusBadge status={c.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-right md:table-cell">
                    {c.milestoneCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-text-primary">
                    {formatMoney(c.value, true)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/contracts/${c.id}`}
                      className="text-body-sm font-medium text-primary-600 hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
        hrefFor={hrefFor}
      />
    </div>
  );
}
